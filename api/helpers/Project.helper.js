const {
    ObjectID
} = require("mongodb");
const ProjectsModel = require("../models/Projects.model");
const NotesModel = require("../models/Notes.model");

module.exports.getProjectById = async (id) => {
    try {

        const mongoResult = await ProjectsModel.aggregate([{
            $match: {
                _id: ObjectID(id)
            }
        },
        {
            $unwind: {
                "path": "$columns",
                "preserveNullAndEmptyArrays": true
            }
        },
        {
            $sort: {
                "columns.position": 1
            }
        },
        {
            $group: {
                _id: '$_id',
                name: {
                    $first: "$name"
                },
                description: {
                    $first: "$description"
                },
                "columns": {
                    $push: "$columns"
                }
            }
        }
        ]);
        console.log(mongoResult);
        const result = mongoResult[0];

        for (const key in result) {
            if (key == "columns") {
                let col = result[key];
                for (let index = 0; index < col.length; index++) {
                    let element = col[index];
                    if (element.notes.length > 0) {
                        col[index]["notes"] = await getNotes(element);
                        console.log(col[index]["notes"].map(x => x.name));
                    }

                }
            }
        }
        return result;
    } catch (error) {
        throw error
    }
}

async function getNotes(element) {
    let noteIds = element.notes.map(note => note.noteId)
    let notes = await NotesModel.find({
        _id: {
            $in: noteIds
        }
    });
    let notesListHashList = {};
    notes.forEach(note => {
        notesListHashList[note._id] = note
    })
    let notesOrderByPostition = []

    noteIds.forEach(id => notesOrderByPostition.push(notesListHashList[id]))

    return notesOrderByPostition
}