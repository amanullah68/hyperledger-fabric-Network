var query = require('../../../app/query');
var log4js = require('log4js');
var logger = log4js.getLogger('Triterras');

exports.getBlockByNumber = async (req, res) => {
	logger.debug('==================== GET BLOCK BY NUMBER ==================');
	let blockId = req.body.blockId;
    let peer = req.body.peers;
    let channelName = req.body.channelName;
    logger.debug('params', req.body);
	logger.debug('channelName : ' + channelName);
	logger.debug('BlockID : ' + blockId);
	logger.debug('Peer : ' + peer);
	if (!blockId) {
		res.json(getErrorMessage('\'blockId\''));
		return;
	}

	let message = await query.getBlockByNumber(peer, channelName, blockId, req.username, req.orgname);
	res.send(message);
};