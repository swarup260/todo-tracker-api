const mongoose = require("mongoose");
const { Schema } = require("mongoose");

const notesSchema = new Schema({
  noteName: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  modifiedAt: {
    type: Date,
    default: Date.now(),
  },
});

/* columns Schema  */
const columnsSchema = new Schema({
  columnName: {
    type: String,
    required: true,
  },
  notes: {
    type: [notesSchema],
  },
});

const projectsSchema = {
  projectName: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: false,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "user",
  },
  columns: {
    type: [columnsSchema],
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  modifiedAt: {
    type: Date,
    default: Date.now(),
  },
};

module.exports = mongoose.model("projects", projectsSchema, "projects");
