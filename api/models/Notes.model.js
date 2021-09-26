const mongoose = require("mongoose");
const {
    Schema
} = require("mongoose");



const commentSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "user",
    },
    comment: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now(),
    },
    udpatedAt: {
        type: Date,
        default: Date.now(),
    }
});

const notesSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String
    },
    projectRef: {
        type: Schema.Types.ObjectId,
        ref: "projects"
    },
    comments: {
        type: [commentSchema]
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


module.exports = mongoose.model("notes", notesSchema, "notes");