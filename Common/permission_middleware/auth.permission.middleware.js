const jwt = require('jsonwebtoken');
const secret = require('../config/env.config')['jwt_secret'];
ADMIN_PERMISSION = 2048 ;

exports.minimumPermissionLevelRequired = (required_permission_level) => {
    return (req, res, next) => {
        const user_permission_level = parseInt(req.jwt.permissionLevel);
        const userId = req.jwt.userId;
        if (user_permission_level === required_permission_level)
            return next();
        else
            res.status(403).send({ errorcode: "403", messgage: 'forbidden Request' });
    };
};

exports.onlySameUserOrAdminCanDoThisAction = (req, res, next) => {
    const user_permission_level = parseInt(req.jwt.permissionLevel);
    const userId = req.jwt.userId;
    const paramsID = parseInt(req.params.userId);
 
    if (req.params && paramsID && userId === paramsID) {
        return next();
    } else {
        if (user_permission_level & ADMIN_PERMISSION) return next();
        else
            res.status(403).send({ errorcode: "403", messgage: 'forbidden Request' });
    }
};

exports.sameUserCantDoThisAction = (req, res, next) => {
    const userId = req.jwt.userId;

    if (req.params.userId !== userId) {
        return next();
    } else {
        res.status(403).send({ errorcode: "403", messgage: 'forbidden Request' })
    }

};
