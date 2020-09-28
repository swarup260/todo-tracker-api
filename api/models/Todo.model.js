const mongoose = require("mongoose");
const {
    Schema
} = require('mongoose');

/* to track the no. of time the deadline is extended  */
const historySchema = new Schema({
    taskName: {
        type: String,
        required: true
    },
    preDeadline: {
        type: Date
    }
})


const todoSchema = {
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
    history: {
        type: [historySchema],
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

module.exports = mongoose.model('todo', todoSchema, 'todo');