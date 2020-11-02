var helper = require('../../app/helper');
var log4js = require('log4js');
var logger = log4js.getLogger('Triterras');
var jwt = require('jsonwebtoken');
var hfc = require('fabric-client');
var express = require('express');
var app = express();

app.set('secret', 'thisismysecret');

exports.registerUser = async (req, res) => {
	var username = req.body.username;
	var orgName = req.body.orgName;
	var role = req.body.role;
	logger.debug('End point : /users');
	logger.debug('User name : ' + username);
	logger.debug('Org name  : ' + orgName);
	logger.debug('role  : ' + role);
	if (!username) {
		console.log('here.............................');
		res.json({
			success: false,
			message: 'User name not defined'
		});
		return;
	}
	if (!orgName) {
		console.log('here111111.............................');
		res.json({
			success: false,
			message: 'Org name not defined'
		});
		return;
	}
	var token = jwt.sign({
		exp: Math.floor(Date.now() / 1000) + parseInt(hfc.getConfigSetting('jwt_expiretime')),
		username: username,
		orgName: orgName
	}, app.get('secret'));
	let response = await helper.getRegisteredUser(username, orgName, role, true);
	logger.debug('-- returned from registering the username %s for organization %s', username, orgName);
	if (response && typeof response !== 'string') {
		logger.debug('Successfully registered the username %s for organization %s', username, orgName);
		response.token = token;
		res.json(response);
	} else {
		logger.debug('Failed to register the username %s for organization %s with::%s', username, orgName, response);
		res.json({ success: false, message: response });
	}

}