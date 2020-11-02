var invoke = require('../../app/invoke-transaction');
var log4js = require('log4js');
var logger = log4js.getLogger('Triterras');

exports.invokeChaincode= async (req, res) => {
	logger.debug('==================== INVOKE ON CHAINCODE ==================');
	var peers = req.body.peers;
	// var peers1 = JSON.parse(req.body.peers);
	// var chaincodeName = 'triterras2';
	var chaincodeName = req.body.chaincodeName;
	var channelName = req.body.channelName;
	var fcn = req.body.fcn;
	// var args = req.body.args;
	var transientMap = req.body.transientMap;

	var args = req.body.args;
	// var params = JSON.parse(req.body.args);
	// const args = [];
	// for(var i in params) {
	// 	args.push(params[i]);
	// }
	
	// const peers = [];
	// for(var i in peers1) {
	// 	peers.push(peers1[i]);
    // }
	logger.debug('channelName  : ' + channelName);
	logger.debug('chaincodeName : ' + chaincodeName);
	logger.debug('fcn  : ' + fcn);
	logger.debug('args  : ' + args);
	logger.debug('peers  : ' + peers[0]);
	logger.debug('transientMap  : ' + transientMap);
	if (!chaincodeName) {
		res.json(getErrorMessage('\'chaincodeName\''));
		return;
	}
	if (!channelName) {
		res.json(getErrorMessage('\'channelName\''));
		return;
	}
	if (!fcn) {
		res.json(getErrorMessage('\'fcn\''));
		return;
	}
	if (!args) {
		res.json(getErrorMessage('\'args\''));
		return;
	}

	let message = await invoke.invokeChaincode(peers[0], channelName, chaincodeName, fcn, args, transientMap, req.username, req.orgname);
	res.send(message);
};