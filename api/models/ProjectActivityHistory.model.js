const mongoose = require("mongoose");
const {
    Schema
} = require('mongoose');

const ProjectActivityHistorySchema = {
    action: {
        type: String,
        enum: ["SAVE", "UPDATE" , "DELETE"],
        default: "SAVE",
    },
    projectRef: {
        type: Schema.Types.ObjectId,
        ref: 'projects'
    },
    data: {
        type: Object,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    user: {
        type: Object,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now()
    }
}

module.exports = mongoose.model('projectActivity', ProjectActivityHistorySchema, 'projectActivity');