const express = require('express');

require('dotenv').config({
    path: '.env'
});

const routes = require('./routes');

const app = express();

app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.use('/', routes);

app.listen(process.env.PORT || 3000, () => {
    console.log(`[SERVER] is running on port ${process.env.PORT || 3000} !`);
});
