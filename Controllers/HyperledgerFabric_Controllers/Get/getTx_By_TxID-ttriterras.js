var query = require('../../../app/query');
var log4js = require('log4js');
var logger = log4js.getLogger('Triterras');

exports.getTransactionByID = async (req, res) => {
	logger.debug('================ GET TRANSACTION BY TRANSACTION_ID ======================');
	logger.debug('channelName : ' + req.body.channelName);
	let trxnId = req.body.trxnId;
	let peer = req.body.peer;
	let channelName = req.body.channelName;
	if (!trxnId) {
		res.json(getErrorMessage('\'trxnId\''));
		return;
	}

	let message = await query.getTransactionByID(peer, channelName, trxnId, req.username, req.orgname);
	res.send(message);
};