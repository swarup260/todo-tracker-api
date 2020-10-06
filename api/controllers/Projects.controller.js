const {
    ObjectID
} = require("mongodb");
const ProjectsModel = require("../models/Projects.model");
const NotesModel = require("../models/Notes.model");
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
            !requestBody.name ||
            requestBody.name == "" ||
            typeof requestBody.name != "string"
        ) {
            return response.status(400).json({
                status: false,
                message: "name required and must be a string",
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
            name: requestBody.name,
            description: requestBody.description,
            user: userData._id,
        });
        const result = await newProject.save();
        if (result) {
            await new ProjectActivityModel({
                action: "SAVE",
                projectRef: result._id,
                data: result,
                message: "new project added",
                user: userData._id
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

// single query
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

        const result = await ProjectsModel.aggregate([{
                $match: {
                    user: userObjectID
                }
            },
            {
                $project: {
                    _id: "$_id",
                    name: "$name",
                    description: "$description",
                }
            }
        ]).exec();
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
                        action: "DELETE",
                        projectRef: id,
                        data: {},
                        message: "project deleted",
                        user: userObjectID
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
            !requestBody.update.name ||
            requestBody.update.name == "" ||
            typeof requestBody.update.name != "string"
        ) {
            return response.status(400).json({
                status: false,
                message: "name required and must be a string",
            });
        }


        if (
            !requestBody.update.position ||
            requestBody.update.position == "" ||
            typeof requestBody.update.position != "number"
        ) {
            return response.status(400).json({
                status: false,
                message: "position required and must be a number",
            });
        }

        const updateObject = {
            name: requestBody.update.name,
            position: requestBody.update.position,
        };

        const project = await ProjectsModel.findById(requestBody.projectId);
        if (!project) {
            return response.status(400).json({
                status: false,
                message: "Project Not Found",
            });
        }

        if (!project.user.equals(userObjectID)) {
            return response.status(400).json({
                status: false,
                message: "Invalid User",
            });
        }

        const result = await ProjectsModel.findOneAndUpdate({
            _id: requestBody.projectId,
            "columns.name": {
                $nin: [requestBody.update.name],
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
                action: "SAVE",
                projectRef: result._id,
                data: result,
                message: `${requestBody.update.name} column added`,
                user: userObjectID
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
            !requestBody.update.name ||
            requestBody.update.name == "" ||
            typeof requestBody.update.name != "string"
        ) {
            return response.status(400).json({
                status: false,
                message: "name required and must be a string",
            });
        }

        const updateObject = {
            "columns.$.name": requestBody.update.name,
        };

        if (requestBody.update.position) {
            updateObject["columns.$.position"] = requestBody.update.position;
        }

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
                message: "Project Not Found",
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
    let projectID = await request.params.projectId;
    let columnID = await request.params.columnId;

    console.log(projectID, columnID);
    const userObjectID = request.userData._id;

    try {
        if (!projectID || !ObjectID.isValid(projectID)) {
            return response.status(400).json({
                status: false,
                message: "projectID required and must be ObjectId",
            });
        }
        if (!columnID || !ObjectID.isValid(columnID)) {
            return response.status(400).json({
                status: false,
                message: "columnID required and must be ObjectId",
            });
        }


        const result = await ProjectsModel.findOneAndUpdate({
            "_id": projectID,
            "columns._id": columnID,
        }, {

            $pull: {
                "columns": {
                    "_id": columnID
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
                action: "DELETE",
                projectRef: projectID,
                data: {},
                message: "column deleted",
                user: userObjectID
            }).save();
        }

        return response.status(200).json({
            status: true,
            message: "Columns Remove successfully",
            data: result,
        });
    } catch (error) {
        console.log(error);
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
            typeof requestBody.projectId != "string" ||
            !ObjectID.isValid(requestBody.projectId)
        ) {
            return response.status(400).json({
                status: false,
                message: "projectId required and must be a string",
            });
        }

        if (
            !requestBody.update.name ||
            requestBody.update.name == "" ||
            typeof requestBody.update.name != "string"
        ) {
            return response.status(400).json({
                status: false,
                message: "name required and must be a string",
            });
        }


        if (
            !requestBody.update.position ||
            requestBody.update.position == "" ||
            typeof requestBody.update.position != "number"
        ) {
            return response.status(400).json({
                status: false,
                message: "position required and must be a number",
            });
        }

        if (
            !requestBody.update.columnRef ||
            requestBody.update.columnRef == "" ||
            typeof requestBody.update.columnRef != "string" ||
            !ObjectID.isValid(requestBody.update.columnRef)
        ) {
            return response.status(400).json({
                status: false,
                message: "columnId required and must be a string",
            });
        }

        const project = await ProjectsModel.find({
            _id: requestBody.projectId,
            "columns._id": requestBody.update.columnRef
        });
        if (project.length == 0) {
            return response.status(400).json({
                status: false,
                message: "Project Not Found",
            });
        }
        const updateObject = {
            name: requestBody.update.name,
            position: requestBody.update.position
        };

        if (requestBody.update.description) {
            updateObject.description = requestBody.update.description;
        }


        /* Add New Note */

        const newNotes = await NotesModel(updateObject)

        newNotes.save();


        const result = await ProjectsModel.findOneAndUpdate({
            _id: requestBody.projectId,
            "columns._id": requestBody.update.columnRef
        }, {
            $addToSet: {
                "columns.$.notes": newNotes._id,
            },
        }, {
            new: true,
        }).exec();


        if (result) {
            await new ProjectActivityModel({
                action: "SAVE",
                projectRef: result._id,
                data: result,
                message: `${updateObject.noteName} note added`,
                user: userObjectID
            }).save();
        }


        return response.status(200).json({
            status: false,
            message: "note added successfully",
            data: newNotes,
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
            "columns.1.notes.noteName": requestBody.update.noteName,
        };

        if (requestBody.update.description) {
            updateObject["columns.1.notes.description"] = requestBody.update.description;
        }


        const result = await ProjectsModel.findOneAndUpdate({
            "_id": requestBody.projectId,
            "columns.notes._id": requestBody.noteId,
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
                "columns.notes": {
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
                action: "DELETE",
                projectRef: id,
                data: {},
                message: "note deleted",
                user: userObjectID
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