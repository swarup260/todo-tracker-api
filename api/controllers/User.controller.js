const bcrypt = require('bcrypt');
const {ObjectID} = require('mongodb');
const UserModel = require('../models/User.model');
const {
    getToken
} = require('../helpers/function.helper');
const config = require('../config');

exports.registerUser = async (request, response) => {
    try {

        const requestBody = request.body;
        /* Validation */
        if (typeof requestBody != "object") {
            return response.status(400).json({
                status: false,
                message: `required type object but instead got ${typeof requestBody}`
            })
        }

        if (!requestBody.username) {
            return response.status(400).json({
                status: false,
                message: `username is required`
            })
        }
        if (!requestBody.password) {
            return response.status(400).json({
                status: false,
                message: `password is required`
            })
        }
        if (!requestBody.email) {
            return response.status(400).json({
                status: false,
                message: `email is required`
            })
        }
        if (!requestBody.email.match(/^[a-zA-Z._].*@[a-z].*\.(com|co|in)$/g)) {
            return response.status(400).json({
                status: false,
                message: `not valid email id`
            })
        }
        /* Hash the Password  */
        requestBody.password = await  bcrypt.hash(requestBody.password , config.SALT_ROUNDS);
        /* Save Response */
        const newUser = new UserModel({
            ...requestBody
        });
        const result = await newUser.save();

        const token = getToken(result);

        return response.status(200).json({
            status: true,
            message: "user created successfully",
            token: token
        });

    } catch (error) {
        return response.status(400).json({
            status: false,
            message: error.message
        })
    }
}

exports.updateUser = async (request, response) => {
    try {
        const requestBody = await request.body;
        const userData = request.userData;
        /* Validation */
        if (typeof requestBody != "object") {
            return response.status(400).json({
                status: false,
                message: `required type object but instead got ${typeof requestBody}`
            })
        }
        if (typeof requestBody.update != "object") {
            return response.status(400).json({
                status: false,
                message: `required type object but instead got ${typeof requestBody.update}`
            })
        }

        if (!ObjectID.isValid(userData._id)) {
            return response.status(400).json({
                status: false,
                message: `invalid user`
            })
        }


        let updateObject = {};
        if (requestBody.update.username) {
            if (typeof requestBody.update.username != "string") {
                return response.status(400).json({
                    status: false,
                    message: `required type string but instead got ${typeof requestBody.update.username}`
                })
            }
            updateObject.username = requestBody.update.username;
        }
        if (requestBody.update.email) {
            
            if (!requestBody.email.match(/^[a-zA-Z._].*@[a-z].*\.(com|co|in)$/g)) {
                return response.status(400).json({
                    status: false,
                    message: `not valid email id`
                })
            }

            updateObject.email = requestBody.update.email;
        }


        if (requestBody.update.password) {
            /* Hash the Password  */
            updateObject.password = await  bcrypt.hash(requestBody.update.password, config.SALT_ROUNDS);
        }

        const result = await UserModel.findByIdAndUpdate(userData._id , updateObject , { new : true }).exec();
        return response.status(200).json({
            status: true,
            message: "user data updated successfully",
            data : result
        })
    } catch (error) {
        response.status(400).json({
            status: false,
            message: error.message
        })
    }
}

exports.getUser = async (request, response) => {
    try {

        let id = await request.params.objectId;
        let users;
        if (id) {
            users = await UserModel.findById(id);
            return response.status(200).json({
                status: 'true',
                message: 'list of users',
                data : users.constructor.name == "Array" ? users : [users] 
            })
        }
        users = await UserModel.find();
        return response.status(200).json({
            status: 'true',
            message: 'list of users',
            data : users.constructor.name == "Array" ? users : [users] 
        })

    } catch (error) {
        response.status(400).json({
            status: false,
            message: error.message
        })
    }
}

exports.deleteUser = async (request, response) => {
    try {
        let id = await request.params.objectId;
        if (!id) {
            return response.status(400).json({
                status: false,
                message: `id not specified`
            })
        }

        if (!ObjectID.isValid(id)) {
            return response.status(400).json({
                status: false,
                message: `invalid id`
            })
        }
        const result = await UserModel
            .findByIdAndDelete(id).exec();
        if (result) {
            return response.status(200).json({
                status: true,
                message: 'user deleted successfully'
            });
        }

        return response.status(200).json({
            status: false,
            message: 'user With ObjectID Not Found'
        });
    } catch (error) {
        response.status(400).json({
            status: false,
            message: error.message
        })
    }
}

exports.login = async (request, response) => {
    try {
        const requestBody = await request.body;
        /* Validation */
        if (typeof requestBody != "object") {
            return response.status(400).json({
                status: false,
                message: `required type object but instead got ${typeof requestBody}`
            })
        }

        if (!requestBody.password) {
            return response.status(400).json({
                status: false,
                message: `password is required`
            })
        }
        if (!requestBody.email) {
            return response.status(400).json({
                status: false,
                message: `email is required`
            })
        }

        if (!requestBody.email.match(/^[a-zA-Z._].*@[a-z].*\.(com|co|in)$/g)) {
            return response.status(400).json({
                status: false,
                message: `not valid email id`
            })
        }

        const user = await UserModel.findOne({email: requestBody.email}).exec();
        if (!user) {
            return response.status(400).json({
                status: false,
                message: 'user not found'
            }) 
        }
        
        if(!user.status){
            return response.status(400).json({
                status: false,
                message: 'user is  disable'
            })
        }
        const userPassword = user.password;
        const flag = await bcrypt.compare(requestBody.password,userPassword);
        if(!flag){
            return response.status(400).json({
                status: false,
                message: 'invalid password'
            }) 
        }

        return response.status(200).json({
            status: true,
            message: 'login successfully',
            token: getToken(user)
        })
        
    } catch (error) {
        response.status(400).json({
            status: false,
            message: error.message
        })
    }
}