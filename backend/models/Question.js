const mongoose = require("mongoose");
const mongodbErrorHandler = require("mongoose-mongodb-errors");

const questionSchema = new mongoose.Schema({
    answers: [
        {
            answer: {
                type: String,
                required: true,
                trim: true,
            },
            correct: {
                type: Boolean,
                required: true,
            },
        },
    ],
    created: {
        type: Date,
        default: Date.now,
    },
    difficulty: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
    },
    online: {
        type: Boolean,
        default: true,
    },
    question: {
        type: String,
        required: true,
        trim: true,
    },
    stats: {
        right: {
            type: Number,
            default: 0,
        },
        wrong: {
            type: Number,
            default: 0,
        },
    },
    theme: {
        type: mongoose.Schema.ObjectId,
        ref: "Theme",
        required: true,
    },
    updated: {
        type: Date,
        default: Date.now,
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: false,
    },
    userUpdated: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: false,
    },
});

questionSchema.plugin(mongodbErrorHandler);

module.exports = mongoose.model("Question", questionSchema);
