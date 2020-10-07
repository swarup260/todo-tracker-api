const { ObjectID } = require("mongodb");
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
                user: userData._id,
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

        const result = await ProjectsModel.aggregate([
            {
                $match: {
                    user: userObjectID,
                },
            },
            {
                $project: {
                    _id: "$_id",
                    name: "$name",
                    description: "$description",
                },
            },
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
        if (!ObjectID.isValid(requestBody.projectId)) {
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

        const result = await ProjectsModel.findOneAndUpdate(
            {
                _id: requestBody.projectId,
                user: userObjectID,
            },
            updateObject,
            {
                new: true,
            }
        ).exec();
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

            const result = await ProjectsModel.deleteOne({
                _id: id,
                user: userObjectID,
            }).exec();

            if (result.deletedCount) {
                if (result) {
                    await new ProjectActivityModel({
                        action: "DELETE",
                        projectRef: id,
                        data: {},
                        message: "project deleted",
                        user: userObjectID,
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
