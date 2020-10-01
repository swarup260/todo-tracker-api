const {
    ObjectID
} = require("mongodb");
const ProjectsModel = require("../models/Projects.model");
const ProjectActivityModel = require("../models/ProjectActivityHistory.model");

/* Projects CRUD */
module.exports.addProject = async (request, response) => {
    const requestBody = request.body;
    const userData = request.userData;
    try {
        if (typeof requestBody != "object") {
            return response.status(400).json({
                status: false,
                message: "must be an object",
            });
        }
        if (
            !requestBody.projectName ||
            requestBody.projectName == "" ||
            typeof requestBody.projectName != "string"
        ) {
            return response.status(400).json({
                status: false,
                message: "projectName required and must be a string",
            });
        }
        if (
            !requestBody.description ||
            requestBody.description == "" ||
            typeof requestBody.description != "string"
        ) {
            return response.status(400).json({
                status: false,
                message: "description required and must be a string",
            });
        }

        const newProject = new ProjectsModel({
            projectName: requestBody.projectName,
            description: requestBody.description,
            user: userData._id,
        });
        const result = await newProject.save();
        if (result) {
            await new ProjectActivityModel({
                action : "SAVE",
                projectRef : result._id,
                data : result,
                message : "new project added",
                user : userData._id
            }).save();
        }

        return response.status(200).json({
            status: false,
            message: "Project created successfully",
            data: result,
        });
    } catch (error) {
        // console.log(error);

        return response.status(400).json({
            status: false,
            message: error,
        });
    }
};

module.exports.getProject = async (request, response) => {
    let id = await request.params.objectId;
    const userObjectID = request.userData._id;
    try {
        if (id) {
            if (typeof id != "string") {
                return response.status(400).json({
                    status: false,
                    message: "id must be string",
                });
            }

            if (!ObjectID.isValid(id)) {
                return response.status(400).json({
                    status: false,
                    message: `invalid object id`,
                });
            }

            const result = await ProjectsModel.find({
                _id: id,
                user: userObjectID,
            }).exec();
            return response.status(200).json({
                status: false,
                message: "Project list",
                data: result,
            });
        }

        const result = await ProjectsModel.find({
            user: userObjectID,
        }).exec();
        return response.status(200).json({
            status: false,
            message: "Project list",
            data: result,
        });
    } catch (error) {
        response.status(400).json({
            status: false,
            message: error.toString(),
        });
    }
};

module.exports.updateProject = async (request, response) => {
    const requestBody = request.body;
    const userObjectID = request.userData._id;
    try {
        if (typeof requestBody != "object") {
            return response.status(400).json({
                status: false,
                message: "must be an object",
            });
        }
        if (
            !ObjectID.isValid(requestBody.projectId)
        ) {
            return response.status(400).json({
                status: false,
                message: "projectId required and must be a object",
            });
        }

        const updateObject = {};

        if (requestBody.update.projectName) {
            updateObject.projectName = requestBody.update.projectName;
        }

        if (requestBody.update.description) {
            updateObject.description = requestBody.update.description;
        }

        const result = await ProjectsModel
            .findOneAndUpdate({
                    _id: requestBody.projectId,
                    user: userObjectID,
                },
                updateObject, {
                    new: true,
                }
            )
            .exec();
        if (!result) {
            response.status(400).json({
                status: false,
                message: "Updated Failed",
            });
        }

        return response.status(200).json({
            status: true,
            message: "project updated successfully",
            data: result,
        });
    } catch (error) {

        response.status(400).json({
            status: false,
            message: error.toString(),
        });
    }
};

module.exports.deleteProject = async (request, response) => {
    let id = await request.params.objectId;
    const userObjectID = request.userData._id;
    try {
        if (id) {
            if (typeof id != "string") {
                return response.status(400).json({
                    status: false,
                    message: "id must be string",
                });
            }

            if (!ObjectID.isValid(id)) {
                return response.status(400).json({
                    status: false,
                    message: `invalid object id`,
                });
            }

            const result = await ProjectsModel
                .deleteOne({
                    _id: id,
                    user: userObjectID,
                })
                .exec();

            if (result.deletedCount) {

                if (result) {
                    await new ProjectActivityModel({
                        action : "DELETE",
                        projectRef : id,
                        data : {},
                        message : "project deleted",
                        user : userObjectID
                    }).save();
                }


                return response.status(200).json({
                    status: true,
                    message: "Project deleted successfully",
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
            message: error.toString(),
        });
    }
};

/* Columns CUD */
module.exports.addColumn = async (request, response) => {
    const requestBody = request.body;
    const userObjectID = request.userData._id;
    try {
        if (typeof requestBody != "object") {
            return response.status(400).json({
                status: false,
                message: "must be an object",
            });
        }
        if (

            !requestBody.projectId ||
            !ObjectID.isValid(requestBody.projectId)
        ) {
            return response.status(400).json({
                status: false,
                message: "projectId required and must be a ObjectID",
            });
        }
        if (
            !requestBody.update.columnName ||
            requestBody.update.columnName == "" ||
            typeof requestBody.update.columnName != "string"
        ) {
            return response.status(400).json({
                status: false,
                message: "columnName required and must be a string",
            });
        }

        const updateObject = {
            columnName: requestBody.update.columnName,
        };


        const result = await ProjectsModel.findOneAndUpdate({
            _id: requestBody.projectId,
            "columns.columnName": {
                $nin: [requestBody.update.columnName],
            },
        }, {
            $push: {
                columns: updateObject,
            },
        }, {
            new: true,
        }).exec();
        if (!result) {
            return response.status(400).json({
                status: false,
                message: "Columns Already Present",
            });
        }

        if (result) {
            await new ProjectActivityModel({
                action : "SAVE",
                projectRef : result._id,
                data : result,
                message : `${requestBody.update.columnName} column added`,
                user : userObjectID
            }).save();
        }

        return response.status(200).json({
            status: true,
            message: "columns added successfully",
            data: result,
        });
    } catch (error) {
        return response.status(400).json({
            status: false,
            message: error,
        });
    }
};

module.exports.updateColumn = async (request, response) => {
    const requestBody = request.body;
    try {
        if (typeof requestBody != "object") {
            return response.status(400).json({
                status: false,
                message: "must be an object",
            });
        }

        if (
            !requestBody.projectId ||
            requestBody.projectId == "" ||
            typeof requestBody.projectId != "string"
        ) {
            return response.status(400).json({
                status: false,
                message: "projectId required and must be a string",
            });
        }

        if (
            !requestBody.columnId ||
            !ObjectID.isValid(requestBody.columnId)
        ) {
            return response.status(400).json({
                status: false,
                message: "columnId required and must be a ObjectID",
            });
        }

        if (
            !requestBody.update.columnName ||
            requestBody.update.columnName == "" ||
            typeof requestBody.update.columnName != "string"
        ) {
            return response.status(400).json({
                status: false,
                message: "columnName required and must be a string",
            });
        }

        const updateObject = {
            "columns.1.columnName": requestBody.update.columnName,
        };


        const result = await ProjectsModel.findOneAndUpdate({
            "_id": requestBody.projectId,
            "columns._id": ObjectID(requestBody.columnId),
        }, {

            $set: updateObject
        }, {
            new: true,
        }).exec();
        if (!result) {
            return response.status(400).json({
                status: false,
                message: "Columns Already Present",
            });
        }

        return response.status(200).json({
            status: true,
            message: "columns added successfully",
            data: result,
        });
    } catch (error) {
        return response.status(400).json({
            status: false,
            message: error,
        });
    }
};

module.exports.deleteColumn = async (request, response) => {
    let id = await request.params.objectId;
    const userObjectID = request.userData._id;

    try {
        if (!id || !ObjectID.isValid(id)) {
            return response.status(400).json({
                status: false,
                message: "id required and must be ObjectID",
            });
        }


        const result = await ProjectsModel.findOneAndUpdate({
            "columns._id": id,
        }, {

            $pull: {
                "columns": {
                    "_id": id
                }
            }
        }, {
            new: true,
        }).exec();
        if (!result) {
            return response.status(400).json({
                status: false,
                message: "Columns Not Present",
            });
        }

        if (result) {
            await new ProjectActivityModel({
                action : "DELETE",
                projectRef : id,
                data : {},
                message : "column deleted",
                user : userObjectID
            }).save();
        }

        return response.status(200).json({
            status: true,
            message: "Columns Remove successfully",
            data: result,
        });
    } catch (error) {
        return response.status(400).json({
            status: false,
            message: error,
        });
    }
};

/* Notes CUD */

module.exports.addNote = async (request, response) => {
    const requestBody = request.body;
    const userObjectID = request.userData._id;
    try {
        if (typeof requestBody != "object") {
            return response.status(400).json({
                status: false,
                message: "must be an object",
            });
        }
        if (
            !requestBody.projectId ||
            requestBody.projectId == "" ||
            typeof requestBody.projectId != "string"
        ) {
            return response.status(400).json({
                status: false,
                message: "projectId required and must be a string",
            });
        }

        if (
            !requestBody.update.noteName ||
            requestBody.update.noteName == "" ||
            typeof requestBody.update.noteName != "string"
        ) {
            return response.status(400).json({
                status: false,
                message: "columnName required and must be a string",
            });
        }

        const updateObject = {
            noteName: requestBody.update.noteName,
            columnRef: requestBody.columnId,
        };

        if (requestBody.update.description) {
            updateObject.description = requestBody.update.description;
        }

        const result = await ProjectsModel.findOneAndUpdate({
            _id: requestBody.projectId,
        }, {
            $push: {
                notes: updateObject,
            },
        }, {
            new: true,
        }).exec();


        if (result) {
            await new ProjectActivityModel({
                action : "SAVE",
                projectRef : result._id,
                data : result,
                message : `${updateObject.noteName} note added`,
                user : userObjectID
            }).save();
        }


        return response.status(200).json({
            status: false,
            message: "note added successfully",
            data: result,
        });
    } catch (error) {
        return response.status(400).json({
            status: false,
            message: error,
        });
    }
};

module.exports.updateNote = async (request, response) => {
    const requestBody = request.body;
    try {
        if (typeof requestBody != "object") {
            return response.status(400).json({
                status: false,
                message: "must be an object",
            });
        }

        if (
            !requestBody.projectId ||
            !ObjectID.isValid(requestBody.projectId)
        ) {
            return response.status(400).json({
                status: false,
                message: "projectId required and must be a ObjectID",
            });
        }

        if (
            !requestBody.noteId ||
            !ObjectID.isValid(requestBody.noteId)
        ) {
            return response.status(400).json({
                status: false,
                message: "noteId required and must be a ObjectID",
            });
        }

        if (
            !requestBody.update.noteName ||
            requestBody.update.noteName == "" ||
            typeof requestBody.update.noteName != "string"
        ) {
            return response.status(400).json({
                status: false,
                message: "noteName required and must be a string",
            });
        }

        const updateObject = {
            "notes.1.noteName": requestBody.update.noteName,
        };

        if (requestBody.update.description) {
            updateObject["notes.1.description"] = requestBody.update.description;
        }
        if (requestBody.update.columnRef) {
            updateObject["notes.1.columnRef"] = requestBody.update.columnRef;
        }


        const result = await ProjectsModel.findOneAndUpdate({
            "_id": requestBody.projectId,
            "notes._id": requestBody.noteId,
        }, {

            $set: updateObject
        }, {
            new: true,
        }).exec();
        if (!result) {
            return response.status(400).json({
                status: false,
                message: "Note Already Present",
            });
        }

        return response.status(200).json({
            status: true,
            message: "Note added successfully",
            data: result,
        });
    } catch (error) {
        return response.status(400).json({
            status: false,
            message: error,
        });
    }
};

module.exports.deleteNote = async (request, response) => {
    let id = await request.params.objectId;
    const userObjectID = request.userData._id;

    try {
        if (!id || !ObjectID.isValid(id)) {
            return response.status(400).json({
                status: false,
                message: "id required and must be ObjectID",
            });
        }


        const result = await ProjectsModel.findOneAndUpdate({
            "notes._id": id,
        }, {

            $pull: {
                "notes": {
                    "_id": id
                }
            }
        }, {
            new: true,
        }).exec();
        if (!result) {
            return response.status(400).json({
                status: false,
                message: "Note Not Present",
            });
        }

        if (result) {
            await new ProjectActivityModel({
                action : "DELETE",
                projectRef : id,
                data : {},
                message : "note deleted",
                user : userObjectID
            }).save();
        }

        return response.status(200).json({
            status: true,
            message: "Note Remove successfully",
            data: result,
        });
    } catch (error) {
        return response.status(400).json({
            status: false,
            message: error,
        });
    }
};