const {
  ObjectID
} = require("mongodb");
const ProjectsModel = require("../../models/Projects.model");
const ProjectActivityModel = require("../../models/ProjectActivityHistory.model");
const projectHelper = require('../../helpers/Project.helper')

const multiUpdate = async (data) => {

  try {

    let response = [];
    const columnsUpdate = data.cols;
    for (let index = 0; index < columnsUpdate.length; index++) {
      const col = columnsUpdate[index];
      const updateObject = {};
      if (col.update.name) {
        updateObject["columns.$.name"] = col.update.name
      }
      if (col.update.hasOwnProperty('position')) {
        updateObject["columns.$.position"] = col.update.position;
      }

      await ProjectsModel.findOneAndUpdate({
        _id: ObjectID(data.projectId),
        "columns._id": ObjectID(col.columnId),
      }, {
        $set: updateObject,
      }).exec();
    }

    return {
      status: true,
      message: "Columns Update Successfully",
      data: await ProjectsModel.findById(ObjectID(data.projectId))
    };

  } catch (error) {
    return {
      status: false,
      message: error.toString(),
    };
  }

}

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
    if (!requestBody.projectId || !ObjectID.isValid(requestBody.projectId)) {
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

    console.log(requestBody);
    console.log(requestBody.update.position == "");
    console.log(typeof requestBody.update.position);
    if (
      requestBody.update.position == "" &&
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
    if (requestBody.update.color) {
      updateObject["color"] = requestBody.update.color;
    }

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
        user: userObjectID,
      }).save();
    }

    return response.status(200).json({
      status: true,
      message: "columns added successfully",
      data: await projectHelper.getProjectById(requestBody.projectId),
    });
  } catch (error) {
    console.log(error);
    return response.status(400).json({
      status: false,
      message: error,
    });
  }
};

module.exports.getColumn = async (request, response) => {
  let projectID = await request.params.projectId;
  try {

    const result = await projectHelper.getProjectById(projectID);

    console.log(result);

    return response.status(200).json({
      status: true,
      message: "list of column",
      data: result
    });

  } catch (error) {
    return response.status(400).json({
      status: false,
      message: error.toString(),
    });
  }
}

module.exports.updateColumn = async (request, response) => {
  const requestBody = request.body;
  const multi = request.query._multi;
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

    /* multi update */
    if (multi) {
      const result = await multiUpdate(requestBody);
      let statusCode = result.status ? 200 : 400;
      return response.status(statusCode).json(result);
    }

    if (!requestBody.columnId || !ObjectID.isValid(requestBody.columnId)) {
      return response.status(400).json({
        status: false,
        message: "columnId required and must be a ObjectID",
      });
    }

    const updateObject = {};

    if (requestBody.update.name) {
      updateObject["columns.$.name"] = requestBody.update.name;
    }

    if (requestBody.update.position) {
      updateObject["columns.$.position"] = requestBody.update.position;
    }
    if (requestBody.update.color) {
      updateObject["columns.$.color"] = requestBody.update.color;
    }

    if (requestBody.update.notes && requestBody.update.notes.constructor.name == "Array") {
      updateObject["columns.$.notes"] = requestBody.update.notes;
    }



    const result = await ProjectsModel.findOneAndUpdate({
      _id: requestBody.projectId,
      "columns._id": ObjectID(requestBody.columnId),
    }, {
      $set: updateObject,
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
    console.log(error);
    return response.status(400).json({
      status: false,
      message: error.toString(),
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
      _id: projectID,
      "columns._id": columnID,
      "columns.notes" : { $size : 0 }
    }, {
      $pull: {
        columns: {
          _id: columnID,
        },
      },
    }, {
      new: true,
    }).exec();
    if (!result) {
      return response.status(400).json({
        status: false,
        message: "Columns Not Present or Notes Exist for current columnn",
      });
    }

    if (result) {
      await new ProjectActivityModel({
        action: "DELETE",
        projectRef: projectID,
        data: {},
        message: "column deleted",
        user: userObjectID,
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