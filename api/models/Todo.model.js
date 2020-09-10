const mongoose = require("mongoose");
const { Schema } = require('mongoose');

const userSchema = {
    taskName: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: false
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    },
    isComplete: {
        type: Boolean,
        default: true
    },
    status: {
        type: Boolean,
        default: true
    },
    deadline: {
        type: Date,
        default: Date.now()
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    modifiedAt: {
        type: Date,
        default: Date.now()
    }

}

module.exports = mongoose.model('todo', userSchema, 'todo');