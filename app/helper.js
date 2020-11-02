2/**
 * Copyright 2017 IBM All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an 'AS IS' BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
'use strict';
var log4js = require('log4js');
var logger = log4js.getLogger('Helper');
logger.setLevel('DEBUG');

var path = require('path');
var util = require('util');

var hfc = require('fabric-client');
hfc.setLogger(logger);

async function getClientForOrg(userorg, username) {
	logger.debug('getClientForOrg - ****** START %s %s', userorg, username)
	// get a fabric client loaded with a connection profile for this org
	let config = '-connection-profile-path';

	// build a client context and load it with a connection profile
	// lets only load the network settings and save the client for later
	let client = hfc.loadFromConfig(hfc.getConfigSetting('network' + config));
	console.log('clienttttttt', client);

	// This will load a connection profile over the top of the current one one
	// since the first one did not have a client section and the following one does
	// nothing will actually be replaced.
	// This will also set an admin identity because the organization defined in the
	// client section has one defined
	client.loadFromConfig(hfc.getConfigSetting(userorg + config));

	// this will create both the state store and the crypto store based
	// on the settings in the client section of the connection profile
	await client.initCredentialStores();

	// The getUserContext call tries to get the user from persistence.
	// If the user has been saved to persistence then that means the user has
	// been registered and enrolled. If the user is found in persistence
	// the call will then assign the user to the client object.
	if (username) {
		let user = await client.getUserContext(username, true);
		if (!user) {
			throw new Error(util.format('User was not found :', username));
		} else {
			logger.debug('User %s was found to be registered and enrolled', username);
		}
	}
	logger.debug('getClientForOrg - ****** END %s %s \n\n', userorg, username)

	return client;
}

var getRegisteredUser = async function (username, userOrg, role, isJson) {
	try {
		var client = await getClientForOrg(userOrg);
		console.log('heeeee');
		logger.debug('Successfully initialized the credential stores');
		// client can now act as an agent for organization Org1
		// first check to see if the user is already enrolled
		var user = await client.getUserContext(username, true);
		var secret;
		if (user && user.isEnrolled()) {
			logger.info('Successfully loaded member from persistence');
		} else {
			// user was not enrolled, so we will need an admin user object to register
			logger.info('User %s was not enrolled, so we will need an admin user object to register', username);
			logger.info('role', role);
			if (role == null || role == undefined) {
				throw new Error('must defined role first');
			}
			else if (role !== 'client' && role !== 'peer' && role !== 'admin') {
				throw new Error('must defined role first-1');
			}
			var admins = hfc.getConfigSetting('admins');
			let adminUserObj = await client.setUserContext({ username: admins[0].username, password: admins[0].secret });
			let caClient = client.getCertificateAuthority();
			let affiliationService = caClient.newAffiliationService();
			let registeredAffiliations = await affiliationService.getAll(adminUserObj);
			if (!registeredAffiliations.result.affiliations.some(x => x.name == userOrg.toLowerCase())) {
				let affiliation = userOrg.toLowerCase() + '.triterras.com';
				await affiliationService.create({
					name: affiliation,
					force: true
				}, adminUserObj);
			}
			secret = await caClient.register({
				'enrollmentID': username,
				'affiliation': userOrg.toLowerCase() + '.triterras.com',
				'roles': [role]
			}, adminUserObj);


			logger.debug('Successfully got the secret for user %s', username);
			logger.debug('Successfully got the secret for user........... %s', secret);
			user = await client.setUserContext({ username: username, password: secret, adminUserObj: adminUserObj });
			logger.debug('Successfullyyyyy got the secret for userrrrr............... %s', user);
			logger.debug('Successfully enrolled user %s  and setUserContext on the client object', user);
		}
		if (user && user.isEnrolled) {
			if (isJson && isJson === true) {
				var response = {
					success: true,
					secret: secret,
					message: username + ' enrolled Successfully',
				};
				return response;
			}
		} else {
			throw new Error('User was not enrolled ');
		}
	} catch (error) {
		logger.error('Failed to get registered user: %s with error: %s', username, error.toString());
		return 'failed ' + error.toString();
	}

};


var setupChaincodeDeploy = function () {
	process.env.GOPATH = path.join(__dirname, hfc.getConfigSetting('CC_SRC_PATH'));
};

var getLogger = function (moduleName) {
	var logger = log4js.getLogger(moduleName);
	logger.setLevel('DEBUG');
	return logger;
};

exports.getClientForOrg = getClientForOrg;
exports.getLogger = getLogger;
exports.setupChaincodeDeploy = setupChaincodeDeploy;
exports.getRegisteredUser = getRegisteredUser;
