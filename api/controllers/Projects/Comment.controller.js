const { ObjectID } = require("mongodb");
const NotesModel = require("../../models/Notes.model");


module.exports.getComment = async (request, response) => {
    try {
        let noteID = await request.params.noteId;

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

        const result = await NotesModel.findOne({
            _id: noteID,
        });

        if (result) {
            return response.status(200).json({
                status: true,
                message: "note comments",
                data: result.comments
            });

        }

        return response.status(200).json({
            status: true,
            message: "Note not found",
        });

    } catch (error) {
        return response.status(400).json({
            status: false,
            message: error,
        });
    }
}

module.exports.addComment = async (request, response) => {
    try {
        const { noteId, comment } = request.body;
        const userObjectID = request.userData._id;

        if (typeof request.body != "object") {
            return response.status(400).json({
                status: false,
                message: "must be an object",
            });
        }

        if (
            !noteId ||
            noteId == "" ||
            typeof noteId != "string" ||
            !ObjectID.isValid(noteId)
        ) {
            return response.status(400).json({
                status: false,
                message: "noteId required and must be a string",
            });
        }

        if (comment == "" || typeof comment != "string") {
            return response.status(400).json({
                status: false,
                message: "must be an string",
            });
        }


        const result = await NotesModel.findOneAndUpdate({
            _id: ObjectID(noteId)
        }, {
            $push: {
                comments: {
                    user: userObjectID,
                    comment: comment,
                    createdAt: Date.now()
                }
            }
        }, {
            new: true,
        })
        console.log(result);

        if (result) {

            return response.status(200).json({
                status: true,
                message: "Comment added successfully",
                data :result
            });
        }


        return response.status(200).json({
            status: true,
            message: "failed to add comment",
        });
    } catch (error) {
        return response.status(400).json({
            status: false,
            message: error,
        });
    }
}

module.exports.updateComment = async (request, response) => {
    try {
        const { noteId, commentId, update } = request.body;
        const userObjectID = request.userData._id;

        if (typeof request.body != "object") {
            return response.status(400).json({
                status: false,
                message: "must be an object",
            });
        }

        if (
            !noteId ||
            noteId == "" ||
            typeof noteId != "string" ||
            !ObjectID.isValid(noteId)
        ) {
            return response.status(400).json({
                status: false,
                message: "noteId required and must be a string",
            });
        }

        if (
            !commentId ||
            commentId == "" ||
            typeof commentId != "string" ||
            !ObjectID.isValid(commentId)
        ) {
            return response.status(400).json({
                status: false,
                message: "commentId required and must be a string",
            });
        }


        if (typeof update != "object") {
            return response.status(400).json({
                status: false,
                message: "update must be an object",
            });
        }

        const updateObject = {
            udpatedAt: Date.now()
        };

        if (update.comment) {
            updateObject["comments.$.comment"] = update.comment;
        }

        const result = await NotesModel.findOneAndUpdate({
            _id: ObjectID(noteId),
            "comments._id": ObjectID(commentId),
        }, {
            $set: updateObject,
        }, {
            new: true,
        }).exec();


        if (result) {

            return response.status(200).json({
                status: true,
                message: "Comment udpate successfully",
                data: result
            });
        }


        return response.status(200).json({
            status: true,
            message: "failed to add comment",
        });
    } catch (error) {
        return response.status(400).json({
            status: false,
            message: error,
        });
    }
}

module.exports.deleteComment = async (request, response) => {
    try {
        const { noteId, commentId } = request.body;

        if (!noteId || !ObjectID.isValid(noteId)) {
            return response.status(400).json({
                status: false,
                message: "noteId required and must be ObjectID",
            });
        }
        if (!commentId || !ObjectID.isValid(commentId)) {
            return response.status(400).json({
                status: false,
                message: "commentId required and must be ObjectID",
            });
        }

        const result = await NotesModel.findOneAndUpdate({
            _id: ObjectID(noteId),
            "comments._id": ObjectID(commentId),
        }, {
            $pull: {
                comments: {
                    _id: ObjectID(commentId),
                },
            },
        }, {
            new: true,
        }).exec();


        if (result) {
            return response.status(200).json({
                status: true,
                message: "comment delete successfully",
                data: result
            });

        }

        return response.status(200).json({
            status: true,
            message: "failed to delete comment",
        });

    } catch (error) {
        return response.status(400).json({
            status: false,
            message: error,
        });
    }
}

