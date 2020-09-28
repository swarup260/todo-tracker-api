const { ObjectID } = require("mongodb");
const ProjectsModel = require("../models/Projects.model");

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

module.exports.addColumns = async (request, response) => {
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

    const result = await ProjectsModel.findByIdAndUpdate(
      requestBody.projectId,
      {
        $push: { columns: updateObject },
      },
      { new: true }
    ).exec();

    return response.status(200).json({
      status: false,
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

module.exports.addNote = async (request, response) => {
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

    const result = await ProjectsModel.findByIdAndUpdate(
      requestBody.projectId,
      {
        $push: { columns: updateObject },
      },
      { new: true }
    ).exec();

    return response.status(200).json({
      status: false,
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
    if (typeof requestBody.update != "object") {
      return response.status(400).json({
        status: false,
        message: "must be an object",
      });
    }

    const updateObject = {};

    if (requestBody.update.taskName) {
      updateObject.taskName = requestBody.update.taskName;
    }
    if (requestBody.update.description) {
      updateObject.description = requestBody.update.description;
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

    const result = await todoModel
      .findOneAndUpdate(
        {
          _id: requestBody.id,
          user: userObjectID,
        },
        updateObject,
        { new: true }
      )
      .exec();

    return response.status(200).json({
      status: true,
      message: "todo updated successfully",
      data: result,
    });
  } catch (error) {
    console.log(error);
    response.status(400).json({
      status: false,
      message: error.toString(),
    });
  }
};

module.exports.getProject = async (request, response) => {
  const id = await request.query.id;
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

      const result = await todoModel
        .find({
          _id: id,
          user: userObjectID,
        })
        .exec();
      return response.status(200).json({
        status: false,
        message: "todo list",
        data: result,
      });
    }

    const result = await todoModel.find({ user: userObjectID }).exec();
    return response.status(200).json({
      status: false,
      message: "todo list",
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

      const result = await todoModel
        .deleteOne({
          _id: id,
          user: userObjectID,
        })
        .exec();
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
      message: error.toString(),
    });
  }
};
