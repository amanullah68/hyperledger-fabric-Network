var query = require('../../../app/query');
var log4js = require('log4js');
var logger = log4js.getLogger('Triterras');

exports.getChannelInfo = async (req, res) => {
	logger.debug('================ GET CHANNEL INFORMATION ======================');
	logger.debug('channelName : ' + req.params.channelName);
	let peer = req.query.peer;

	let message = await query.getChainInfo(peer, req.params.channelName, req.username, req.orgname);
	res.send(message);
};