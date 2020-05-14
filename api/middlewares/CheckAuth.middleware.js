const jwt = require('jsonwebtoken');
const config = require('../config');
const {
    userExists
} = require('../helpers/function.helper');

module.exports = async (request, response, next) => {
    try {
        const token = await request.headers.authorization.split(" ")[1]
        const decoded = jwt.verify(token, config.JWT_SECRET);
        const user = await userExists(decoded);
        request.userData = user;
        next();
    } catch (error) {
        return response.status(401).json({
            status: false,
            message: 'Unauthorised Access'
        });
    }

}