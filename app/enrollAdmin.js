/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const FabricCAServices = require('fabric-ca-client');
const { FileSystemWallet, X509WalletMixin } = require('fabric-network');
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
var log4js = require('log4js');
var logger = log4js.getLogger('enrollAdmin');
var util = require('util');

const filePath = path.join(process.cwd(), './my-network/network-config.yaml');
let fileContents = fs.readFileSync(filePath, 'utf8');
let connectionFile = yaml.safeLoad(fileContents);

var enrollAdmin = async (appAdmin, appAdminSecret, userName, orgMSPID, caName) => {
    var error_message = null;
    var all_eventhubs = [];

    try {
        console.log('params : ', appAdmin, appAdminSecret, userName, orgMSPID, caName);
        logger.debug('params : ', appAdmin, appAdminSecret, userName, orgMSPID, caName);
        // logger.debug('connection file : ', connectionFile);
        // Create a new CA client for interacting with the CA.
        const caURL = 'https://localhost:7054';
        const ca = new FabricCAServices(caURL);
        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = new FileSystemWallet(walletPath);

        // Check to see if we've already enrolled the admin user.
        const adminExists = await wallet.exists(userName);
        if (adminExists) {
            console.log('An identity for the admin user "admin" already exists in the wallet');
            return;
        }

        // Enroll the admin user, and import the new identity into the wallet.

        const enrollment = await ca.enroll({ enrollmentID: appAdmin, enrollmentSecret: appAdminSecret });
        logger.info('enrollment ', enrollment);

        const identity = X509WalletMixin.createIdentity(orgMSPID, enrollment.certificate, enrollment.key.toBytes());
        logger.info('identity ', identity);
        wallet.import(userName, identity);

        console.log('msg: Successfully enrolled admin user ' + userName + ' and imported it into the wallet');

        logger.info('msg: Successfully enrolled admin user ' + userName + ' and imported it into the wallet');


    } catch (error) {
        logger.error(`Failed to enroll admin user: ${userName} ${error}`);
        error_message = error.toString();
        // console.error(`Failed to enroll admin user: ${userName} ${error}`);
        // process.exit(1);
    }

    // need to shutdown open event streams
    all_eventhubs.forEach((eh) => {
        eh.disconnect();
    });

    if (!error_message) {
        let message = util.format(
            'msg: Successfully enrolled admin user ' + userName + ' and imported it into the wallet');
        logger.info(message);
        // build a response to send back to the REST caller
        const response = {
            success: true,
            message: message
        };
        return response;
    } else {
        let message = util.format('Failed to join all peers to channel. cause:%s', error_message);
        logger.error(message);
        // build a response to send back to the REST caller
        const response = {
            success: false,
            message: message
        };
        return response;
    }
}

exports.enrollAdmin = enrollAdmin;
