const todoModel = require('../models/Todo.model');

const {
    ObjectID
} = require('mongodb');


module.exports.addTodo = async (request, response) => {
    const requestBody = request.body;
    const userData = request.userData;
    try {
        if (typeof requestBody != 'object') {
            return response.status(400).json({
                status: false,
                message: "must be an object"
            })
        }
        if (!requestBody.taskName && requestBody.taskName == "" && typeof requestBody.taskName != "string") {
            return response.status(400).json({
                status: false,
                message: "taskName required and must be a string"
            })
        }

        if (!requestBody.hasOwnProperty("status") && typeof requestBody.status != "boolean") {
            return response.status(400).json({
                status: false,
                message: "status required and must be a boolean"
            })
        }
        if (!requestBody.deadline && requestBody.deadline == "" && typeof requestBody.deadline != "string") {
            return response.status(400).json({
                status: false,
                message: "deadline required and must be a string"
            })
        }

        const newTodo = new todoModel({
            taskName: requestBody.taskName,
            status: requestBody.status,
            isComplete: false,
            deadline: requestBody.deadline,
            user: userData._id
        });
        const result = await newTodo.save();

        return response.status(200).json({
            status: false,
            message: "task added successfully",
            data: result
        });


    } catch (error) {
        // console.log(error);

        return response.status(400).json({
            status: false,
            message: error
        })
    }
}


module.exports.updateTodo = async (request, response) => {
    const requestBody = request.body;
    const userObjectID = request.userData._id;
    try {
        if (typeof requestBody != 'object') {
            return response.status(400).json({
                status: false,
                message: "must be an object"
            })
        }
        if (typeof requestBody.update != 'object') {
            return response.status(400).json({
                status: false,
                message: "must be an object"
            });
        }

        const updateObject = {};

        if (requestBody.update.taskName) {
            updateObject.taskName = requestBody.update.taskName;
        }
        if (requestBody.update.hasOwnProperty("status")) {
            updateObject.status = requestBody.update.status;
        }

        if (requestBody.update.hasOwnProperty("isComplete")) {
            updateObject.isComplete = requestBody.update.isComplete;
        }
        if (requestBody.update.deadline) {
            updateObject.deadline = Date.parse(requestBody.update.deadline);
        }
        
        const result = await todoModel.findOneAndUpdate({
            _id: requestBody.id,
            user : userObjectID
        }, updateObject,
            { new: true }
        ).exec();

        return response.status(200).json({
            status: true,
            message: "todo updated successfully",
            data: result
        })


    } catch (error) {
        console.log(error)
        response.status(400).json({
            status: false,
            message: error.toString()
        })
    }
}

module.exports.getTodo = async (request, response) => {
    const id = await request.query.id;
    const userObjectID = request.userData._id;
    try {
        if (id) {
            if (typeof id != 'string') {
                return response.status(400).json({
                    status: false,
                    message: "id must be string"
                })
            }

            if (!ObjectID.isValid(id)) {
                return response.status(400).json({
                    status: false,
                    message: `invalid object id`
                })
            }

            const result = await todoModel.find({
                _id: id,
                user: userObjectID
            }).exec();
            return response.status(200).json({
                status: false,
                message: "todo list",
                data: result
            });

        }

        const result = await todoModel.find({ user: userObjectID }).exec();
        return response.status(200).json({
            status: false,
            message: "todo list",
            data: result
        });


    } catch (error) {
        response.status(400).json({
            status: false,
            message: error.toString()
        })
    }
}

module.exports.deleteTodo = async (request, response) => {
    let id = await request.params.objectId;
    const userObjectID = request.userData._id;
    try {
        if (id) {
            if (typeof id != 'string') {
                return response.status(400).json({
                    status: false,
                    message: "id must be string"
                })
            }

            if (!ObjectID.isValid(id)) {
                return response.status(400).json({
                    status: false,
                    message: `invalid object id`
                })
            }

            const result = await todoModel.deleteOne({
                _id: id,
                user: userObjectID
            }).exec();
            console.log(result);
            
            if (result.deletedCount) {
                return response.status(200).json({
                    status: true,
                    message: "todo deleted successfully",
                });
            }

            return response.status(400).json({
                status: false,
                message: "failed to delete",
            });

        }


    } catch (error) {
        response.status(400).json({
            status: false,
            message: error.toString()
        })
    }
}