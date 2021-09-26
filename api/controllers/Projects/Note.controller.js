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
          "columns.$.notes": { noteId:newNotes._id , position :requestBody.update.position},
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
      requestBody.update.name && 
      typeof requestBody.update.name != "string"
    ) {
      return response.status(400).json({
        status: false,
        message: "name  must be a string",
      });
    }

    if (
      requestBody.update.description && 
      typeof requestBody.update.description != "string"
    ) {
      return response.status(400).json({
        status: false,
        message: "name  must be a string",
      });
    }

    const updateObject = {};

    if (requestBody.update.name) {
      updateObject["name"] = requestBody.update.name;
    }

    if (requestBody.update.description) {
      updateObject["description"] = requestBody.update.description;
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
      message: "Note updated successfully",
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
  const {noteId ,projectRef , columnRef } = request.body;

  try {
    if (!noteId || !ObjectID.isValid(noteId)) {
      return response.status(400).json({
        status: false,
        message: "noteId required and must be ObjectID",
      });
    }

    if (!projectRef || !ObjectID.isValid(projectRef)) {
      return response.status(400).json({
        status: false,
        message: "projectRef required and must be ObjectID",
      });
    }

    if (!columnRef || !ObjectID.isValid(columnRef)) {
      return response.status(400).json({
        status: false,
        message: "columnRef required and must be ObjectID",
      });
    }

    const project = await ProjectsModel.find(
      {
        _id: projectRef,
        "columns._id": columnRef,
      },
      {_id: 0, 'columns.$': 1}
      );

    if (project.length == 0) {
      return response.status(400).json({
        status: false,
        message: "project/column not found",
      });
    }

    const notes = project[0].columns[0].notes.filter(note => note.noteId != noteId);

    const updateNotes = await ProjectsModel.findOneAndUpdate(
      {
        _id: projectRef,
        "columns._id": columnRef,
      },
      {
        $set: {
          "columns.$.notes": notes,
        },
      },
      {
        new: true,
      }
    ).exec();

    if (!updateNotes) {
      return response.status(400).json({
        status: false,
        message: "project/column failed to udpate",
      });
    }

    const result = await NotesModel.deleteOne({
      _id: noteId,
    }).exec();
    if (!result) {
      return response.status(400).json({
        status: false,
        message: "Note Not Present",
      });
    }

    /* update project Columns */


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
