const express = require('express');
const Router = express.Router();
const config = require('../Common/config/env.config');


const ADMIN = config.permissionLevels.ADMIN;
const PAID = config.permissionLevels.PAID_USER;
const FREE = config.permissionLevels.NORMAL_USER;


const PermissionMiddleware = require('../Common/permission_middleware/auth.permission.middleware');
const ValidationMiddleware = require('../Common/permission_middleware/auth.validation.middleware')

// not in used just for backup & testing purpose
Router.post('/hyperledger/enrollAdmin', [
    // ValidationMiddleware.validJWTNeeded,
    // PermissionMiddleware.minimumPermissionLevelRequired(ADMIN)
], require('../Controllers/HyperledgerFabric_Controllers/enrollAdmin').enrollAdmin);

// Register and enroll user
Router.post('/hyperledger/users', [
    // ValidationMiddleware.validJWTNeeded,
    // PermissionMiddleware.minimumPermissionLevelRequired(ADMIN)
], require('../Controllers/HyperledgerFabric_Controllers/registerUser').registerUser);

// create Channel
Router.post('/hyperledger/channels', [
    // ValidationMiddleware.validJWTNeeded,
    // PermissionMiddleware.minimumPermissionLevelRequired(ADMIN)
], require('../Controllers/HyperledgerFabric_Controllers/createChannel').createChannel);

// join Channel
Router.post('/hyperledger/channels/:channelName/peers', [
    // ValidationMiddleware.validJWTNeeded,
    // PermissionMiddleware.minimumPermissionLevelRequired(ADMIN)
], require('../Controllers/HyperledgerFabric_Controllers/joinChannel').joinChannel);

// Update anchor peers
Router.post('/hyperledger/channels/:channelName/anchorpeers', [
    // ValidationMiddleware.validJWTNeeded,
    // PermissionMiddleware.minimumPermissionLevelRequired(ADMIN)
], require('../Controllers/HyperledgerFabric_Controllers/updateAnchorPeers').updateAnchorPeers);

// Install chaincode on target peers
Router.post('/hyperledger/chaincodes', [
    // ValidationMiddleware.validJWTNeeded,
    // PermissionMiddleware.minimumPermissionLevelRequired(ADMIN)
], require('../Controllers/HyperledgerFabric_Controllers/installChaincode').installChainCode);

// Instantiate transaction on chaincode on target peers
Router.post('/hyperledger/channels/initiateChaincodes', [
    // ValidationMiddleware.validJWTNeeded,
    // PermissionMiddleware.minimumPermissionLevelRequired(ADMIN)
], require('../Controllers/HyperledgerFabric_Controllers/initiateChainCode').instantiateChaincode);

// Invoke chaincode on target peers
Router.post('/hyperledger/channels/invokeChaincodes', [
    // ValidationMiddleware.validJWTNeeded,
    // PermissionMiddleware.minimumPermissionLevelRequired(ADMIN)
], require('../Controllers/HyperledgerFabric_Controllers/invokeChainCode').invokeChaincode);

// Query on chaincode on target peers
Router.get('/hyperledger/channels/:channelName/chaincodes/:chaincodeName', [
    // ValidationMiddleware.validJWTNeeded,
    // PermissionMiddleware.minimumPermissionLevelRequired(ADMIN)
], require('../Controllers/HyperledgerFabric_Controllers/Get/queryOnChainCode').queryChaincode);

//  Query Get Block by BlockNumber
Router.get('/hyperledger/blockDetail', [
    // ValidationMiddleware.validJWTNeeded,
    // PermissionMiddleware.minimumPermissionLevelRequired(ADMIN)
], require('../Controllers/HyperledgerFabric_Controllers/Get/getBlockByBlockNumber-triterras').getBlockByNumber);

//  Query Get Block by BlockNumber
Router.get('/hyperledger/channels/:channelName/blocks/:blockId', [
    // ValidationMiddleware.validJWTNeeded,
    // PermissionMiddleware.minimumPermissionLevelRequired(ADMIN)
], require('../Controllers/HyperledgerFabric_Controllers/Get/getBlockByBlockNumber').getBlockByNumber);

// Query Get Transaction by Transaction ID
Router.get('/hyperledger/channels/:channelName/transactions/:trxnId', [
    // ValidationMiddleware.validJWTNeeded,
    // PermissionMiddleware.minimumPermissionLevelRequired(ADMIN)
], require('../Controllers/HyperledgerFabric_Controllers/Get/getTx_By_TxID-back').getTransactionByID);

// Query Get Transaction by Transaction ID
Router.get('/hyperledger/channels/txdetails', [
    // ValidationMiddleware.validJWTNeeded,
    // PermissionMiddleware.minimumPermissionLevelRequired(ADMIN)
], require('../Controllers/HyperledgerFabric_Controllers/Get/getTx_By_TxID-ttriterras').getTransactionByID);

// Query Get Block by Hash
Router.get('/hyperledger/channels/:channelName/blocks', [
    // ValidationMiddleware.validJWTNeeded,
    // PermissionMiddleware.minimumPermissionLevelRequired(ADMIN)
], require('../Controllers/HyperledgerFabric_Controllers/Get/getBlockHash').getBlockByHash);

//Query for Channel Information
Router.get('/hyperledger/channels/:channelName', [
    // ValidationMiddleware.validJWTNeeded,
    // PermissionMiddleware.minimumPermissionLevelRequired(ADMIN)
], require('../Controllers/HyperledgerFabric_Controllers/Get/getChannelInfo').getChannelInfo);

//Query for Channel instantiated chaincodes
Router.get('/hyperledger/channels', [
    // ValidationMiddleware.validJWTNeeded,
    // PermissionMiddleware.minimumPermissionLevelRequired(ADMIN)
], require('../Controllers/HyperledgerFabric_Controllers/Get/getChannelInitiatedCode').getInstalledChaincodes);

// Query to fetch all Installed/instantiated chaincodes
Router.get('/hyperledger/chaincodes', [
    // ValidationMiddleware.validJWTNeeded,
    // PermissionMiddleware.minimumPermissionLevelRequired(ADMIN)
], require('../Controllers/HyperledgerFabric_Controllers/Get/getInstalled_InitiatedChainCode').getInstalledChaincodes);


module.exports = Router 