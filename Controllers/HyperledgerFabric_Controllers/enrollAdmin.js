/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

var enrollAdmin = require('../../app/enrollAdmin');
var log4js = require('log4js');
var logger = log4js.getLogger('Triterras');

exports.enrollAdmin = async (req, res) => {
        let appAdmin = req.body.appAdmin;
        let appAdminSecret = req.body.appAdminSecret;
        let userName = req.body.userName;
        let orgMSPID = req.body.orgMSPID;
        let caName = req.body.caName;

        let message = enrollAdmin.enrollAdmin(appAdmin, appAdminSecret, userName, orgMSPID, caName);
        console.log('messasge..............', message);
        res.send(message);
};
