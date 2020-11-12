/* dependencies  */
const moment = require("moment");

/* custom dependencies  */
const jwt = require('jsonwebtoken');
const config = require('../config');
const userModel = require('../models/User.model');

exports.getToken = data => jwt.sign({
    username: data.username,
    email: data.email
}, config.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRES
});

exports.userExists = async data => {
    const user = await userModel.findOne({
        email: data.email
    });
    if (!user) {
        throw new Error("user not found");
    }

    if (!user.status) {
        throw new Error("user is  disable");
    }
    return await user;
}

exports.getFormatedMessage = ({ message , user ,roomName }) => {
    return {
        message : message,
        user : user,
        room :  roomName,
        time : moment().format("HH:MM a")
    }
}