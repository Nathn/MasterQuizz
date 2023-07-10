const mongoose = require('mongoose');
const mongodbErrorHandler = require('mongoose-mongodb-errors');

const questionSchema = new mongoose.Schema({
    answers: [{
        answer: {
            type: String,
            required: true,
            trim: true
        },
        correct: {
            type: Boolean,
            required: true
        }
    }],
    created: {
        type: Date,
        default: Date.now
    },
    difficulty: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    question: {
        type: String,
        required: true,
        trim: true
    },
    theme: {
        type: mongoose.Schema.ObjectId,
        ref: 'Theme',
        required: true
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: false
    }
});

questionSchema.plugin(mongodbErrorHandler);

module.exports = mongoose.model('Question', questionSchema);
