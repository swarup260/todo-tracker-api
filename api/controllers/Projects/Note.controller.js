const { ObjectID } = require("mongodb");
const ProjectsModel = require("../../models/Projects.model");
const NotesModel = require("../../models/Notes.model");
const ProjectActivityModel = require("../../models/ProjectActivityHistory.model");

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
      !requestBody.update.columnRef ||
      requestBody.update.columnRef == "" ||
      typeof requestBody.update.columnRef != "string" ||
      !ObjectID.isValid(requestBody.update.columnRef)
    ) {
      return response.status(400).json({
        status: false,
        message: "columnRef required and must be a string",
      });
    }

    const project = await ProjectsModel.find({
      _id: requestBody.projectId,
      "columns._id": requestBody.update.columnRef,
    });
    if (project.length == 0) {
      return response.status(400).json({
        status: false,
        message: "Project Not Found",
      });
    }
    const updateObject = {
      name: requestBody.update.name,
      projectRef: requestBody.projectId,
    };

    if (requestBody.update.description) {
      updateObject.description = requestBody.update.description;
    }

    /* Add New Note */

    const newNotes = await NotesModel(updateObject);

    newNotes.save();

    const result = await ProjectsModel.findOneAndUpdate(
      {
        _id: requestBody.projectId,
        "columns._id": requestBody.update.columnRef,
      },
      {
        $addToSet: {
          "columns.$.notes": newNotes._id,
        },
      },
      {
        new: true,
      }
    ).exec();

    if (result) {
      await new ProjectActivityModel({
        action: "SAVE",
        projectRef: result._id,
        data: result,
        message: `${updateObject.noteName} note added`,
        user: userObjectID,
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

module.exports.getNote = async (request, response) => {
  let projectID = await request.params.projectId;
  let noteID = await request.params.noteId;
  try {
    if (
      !projectID ||
      projectID == "" ||
      typeof projectID != "string" ||
      !ObjectID.isValid(projectID)
    ) {
      return response.status(400).json({
        status: false,
        message: "projectID required and must be a string",
      });
    }

    if (noteID) {
      if (
        !noteID ||
        noteID == "" ||
        typeof noteID != "string" ||
        !ObjectID.isValid(noteID)
      ) {
        return response.status(400).json({
          status: false,
          message: "noteID required and must be a string",
        });
      }

      const result = await NotesModel.find({
        _id: noteID,
      });

      return response.status(200).json({
        status: false,
        message: "Notes",
        data: result,
      });
    }

    const result = await NotesModel.find({
      projectRef: projectID,
    });

    return response.status(200).json({
      status: false,
      message: "Notes List",
      data: result,
    });
  } catch (error) {
    return response.status(400).json({
      status: false,
      message: error.toString(),
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

    if (!requestBody.projectId || !ObjectID.isValid(requestBody.projectId)) {
      return response.status(400).json({
        status: false,
        message: "projectId required and must be a ObjectID",
      });
    }

    if (!requestBody.noteId || !ObjectID.isValid(requestBody.noteId)) {
      return response.status(400).json({
        status: false,
        message: "noteId required and must be a ObjectID",
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
      name: requestBody.update.name,
    };

    if (requestBody.update.description) {
      updateObject["description"] = requestBody.update.description;
    }

    /* Change Column */
    if (requestBody.update.columnRef) {
      // pull the note id from exists column if present
      const pullResult = await ProjectsModel.findOneAndUpdate(
        {
          _id: requestBody.projectId,
          "columns.notes": { $in: [requestBody.noteId] },
        },
        {
          $pull: {
            "columns.$.notes": { $in: [requestBody.noteId] },
          },
        }
      );
    
    //   if (!pullResult) {
    //     return response.status(400).json({
    //       status: false,
    //       message: "Fail to updated",
    //     });
    //   }
      //push the note to new column
      const pushResult = await ProjectsModel.findOneAndUpdate(
        {
          _id: requestBody.projectId,
          "columns._id": requestBody.update.columnRef,
        },
        {
          $addToSet: {
            "columns.$.notes": requestBody.noteId,
          },
        },
        {
          new: true,
        }
      ).exec();

      if (!pushResult) {
        return response.status(400).json({
          status: false,
          message: "Fail to updated",
        });
      }
    }

    const result = await NotesModel.findOneAndUpdate(
      {
        _id: requestBody.noteId,
        projectRef: requestBody.projectId,
      },
      updateObject,
      {
        new: true,
      }
    ).exec();
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

    const result = await NotesModel.deleteOne({
      _id: id,
    }).exec();
    if (!result) {
      return response.status(400).json({
        status: false,
        message: "Note Not Present",
      });
    }

    // if (result) {
    //     await new ProjectActivityModel({
    //         action: "DELETE",
    //         projectRef: id,
    //         data: {},
    //         message: "note deleted",
    //         user: userObjectID
    //     }).save();
    // }

    return response.status(200).json({
      status: true,
      message: "Note Remove successfully",
    });
  } catch (error) {
    return response.status(400).json({
      status: false,
      message: error,
    });
  }
};
