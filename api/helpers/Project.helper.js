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
                $unwind: '$columns'
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
        const result = mongoResult[0];

        for (const key in result) {
            if (key == "columns") {
                let col = result[key];
                for (let index = 0; index < col.length; index++) {
                    let element = col[index];
                    if (element.notes.length > 0) {
                        col[index]["notes"] = await getNotes(element, col, index);
                    }

                }
            }
        }
        return result;
    } catch (error) {
        throw error
    }
}

async function getNotes(element, col, index) {
    const idIndexes = {};
    const notesSort = [];
    let notes = await NotesModel.find({
        _id: {
            $in: element.notes.map(item => item.noteId)
        }
    });


    for (let index = 0; index < notes.length; index++) {
        const element = notes[index];
        idIndexes[element._id] = element;
    }
    element.notes.forEach(element => {
        notesSort.push(idIndexes[element.noteId]);
    });
    return notesSort;
}