const mongoose = require("mongoose");
const {
  Schema
} = require("mongoose");


/* columns Schema  */
const columnsSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  position: {
    type: Number,
    required: false,
  },
  notes: {
    type: [],
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

const projectsSchema = {
  name: {
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