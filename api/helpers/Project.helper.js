const {
    ObjectID
  } = require("mongodb");
  const ProjectsModel = require("../models/Projects.model");
  const NotesModel = require("../models/Notes.model");

module.exports.getProjectById = async (id) => {
    try {

        const result = await ProjectsModel.findOne({
            _id: ObjectID(id)
        }).lean();
        for (const key in result) {
            if (key == "columns") {
                let col = result[key];
                for (let index = 0; index < col.length; index++) {
                    let element = col[index];
                    let notes = await NotesModel.find({
                        _id: {
                            $in: element.notes
                        }
                    });
                    col[index]["notes"] = notes;

                }
            }
        }
        return result;
    } catch (error) {
        throw error
    }
}