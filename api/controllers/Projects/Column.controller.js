const { ObjectID } = require("mongodb");
const ProjectsModel = require("../../models/Projects.model");
const NotesModel = require("../../models/Notes.model");
const ProjectActivityModel = require("../../models/ProjectActivityHistory.model");

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

    const result = await ProjectsModel.findOneAndUpdate(
      {
        _id: requestBody.projectId,
        "columns.name": {
          $nin: [requestBody.update.name],
        },
      },
      {
        $push: {
          columns: updateObject,
        },
      },
      {
        new: true,
      }
    ).exec();
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
      data: result,
    });
  } catch (error) {
    return response.status(400).json({
      status: false,
      message: error,
    });
  }
};

module.exports.getColumn = async (request, response) => {
    let projectID = await request.params.projectId;
    try {
        
        const result = await ProjectsModel.findOne({  _id : ObjectID(projectID)  });

        for (const key in result) {
            if (key == "columns") {
                console.log(result[key]);
            }
        }

        return response.status(200).json({
            status : true,
            message : "list of column",
            data :  result
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

    if (!requestBody.columnId || !ObjectID.isValid(requestBody.columnId)) {
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

    const result = await ProjectsModel.findOneAndUpdate(
      {
        _id: requestBody.projectId,
        "columns._id": ObjectID(requestBody.columnId),
      },
      {
        $set: updateObject,
      },
      {
        new: true,
      }
    ).exec();
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

    const result = await ProjectsModel.findOneAndUpdate(
      {
        _id: projectID,
        "columns._id": columnID,
      },
      {
        $pull: {
          columns: {
            _id: columnID,
          },
        },
      },
      {
        new: true,
      }
    ).exec();
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
