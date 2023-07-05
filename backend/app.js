const express = require('express');
const cors = require('cors');
const path = require('path');

require('dotenv').config({
    path: 'backend/.env'
});

const routes = require('./routes');

const app = express();

app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));

app.use((req, res, next) => {
    if (req.method === 'GET') { // GET requests don't need CORS
        res.setHeader('Access-Control-Allow-Origin', '*');
        next();
    } else { // POST, PUT, DELETE, etc. requests need CORS verification
        const referer = req.headers.referer;
        if (!referer) {
            res.status(403).json({
                message: 'Forbidden'
            });
        } else {
            if (process.env.CORS_WHITELIST.split(',').includes(referer)) {
                res.setHeader('Access-Control-Allow-Origin', referer);
                next();
            } else {
                res.status(403).json({
                    message: 'Forbidden'
                });
            }
        }
    }
});

app.use(express.static(path.join(__dirname, '../dist/master-quizz'), {
    setHeaders: (res, path, stat) => {
        const mimeType = {
            '.js': 'text/javascript',
            '.css': 'text/css',
            '.html': 'text/html',
            '.png': 'image/png',
            '.jpg': 'image/jpg',
            '.gif': 'image/gif',
            '.svg': 'image/svg+xml'
        };
        const ext = path.slice(path.lastIndexOf('.'));
        res.setHeader('Content-Type', mimeType[ext] || 'text/plain');
    }
}));

app.use('/', routes);

app.listen(process.env.PORT || 3000, () => {
    console.log(`[SERVER] is running on port ${process.env.PORT || 3000} !`);
});
