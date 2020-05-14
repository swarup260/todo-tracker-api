const mongoose = require("mongoose");

const userSchema = {
    username: {
        type: String,
        required: true
    },
    email: {
        type : String,
        unique : true,
        required : true
    },
    password : {
        type: String,
        required: true
    },
    status: {
        type : Boolean,
        default : true
    },
    createdAt : {
        type: Date,
        default : Date.now()
    },
    modifiedAt: {
        type: Date,
        default: Date.now()
    }
    
}

module.exports = mongoose.model('user' , userSchema ,'user');