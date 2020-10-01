const mongoose = require("mongoose");
const { Schema } = require("mongoose");

/* columns Schema  */
const historySchema = new Schema({
  routineDone: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

const HabitSchema = {
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
  type: {
    type: String,
    enum: ["DAILY", "WEEKLY"],
    default: "DAILY",
  },
  status: {
    type: Boolean,
    default: true,
  },
  timeInterval: {
    type: Date,
  },
  history: {
    type: [historySchema],
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

module.exports = mongoose.model("habit", HabitSchema, "habit");
