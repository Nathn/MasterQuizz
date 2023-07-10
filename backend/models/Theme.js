const mongoose = require('mongoose');
const mongodbErrorHandler = require('mongoose-mongodb-errors');

const themeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    code: {
        type: String,
        required: true,
        trim: true
    }
});

themeSchema.plugin(mongodbErrorHandler);

module.exports = mongoose.model('Theme', themeSchema);
