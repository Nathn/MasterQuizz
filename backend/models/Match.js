const mongoose = require('mongoose');
const mongodbErrorHandler = require('mongoose-mongodb-errors');

const matchSchema = new mongoose.Schema({
    created: {
        type: Date,
        default: Date.now
    },
    questions: [{
        type: mongoose.Schema.ObjectId,
        ref: 'Question'
    }],
    currentQuestion: {
        type: Number,
        default: 0
    },
    started: {
        type: Number,
        default: 0
    },
    ended: {
        type: Boolean,
        default: false
    },
    users: [{
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    }]
});

matchSchema.plugin(mongodbErrorHandler);

module.exports = mongoose.model('Match', matchSchema);
