var query = require('../../../app/query');
var log4js = require('log4js');
var logger = log4js.getLogger('Triterras');

exports.getChannels = async (req, res) => {
	logger.debug('================ GET CHANNELS ======================');
	logger.debug('peer: ' + req.query.peer);
	var peer = req.query.peer;
	if (!peer) {
		res.json(getErrorMessage('\'peer\''));
		return;
	}

	let message = await query.getChannels(peer, req.username, req.orgname);
	res.send(message);
};