const path = require("path");
const http = require('http');
const express = require("express");
const Filter = require('bad-words');

const app = express();
const server = http.createServer(app);
const io = require('socket.io')(server);

const port = process.env.PORT;

const publicFolder = path.join(__dirname, '../public');
app.use(express.static(publicFolder));

io.on('connection', socket => {
    socket.emit('message', 'Welcome!');
    socket.broadcast.emit('message', 'A new user has joined!');

    socket.on('message', (msg, cb) => {
        const filter = new Filter();

        if (filter.isProfane(msg)) return cb('Profanity is not allowed');

        io.emit('message', msg);
        cb('delievered');
    });

    socket.on('location', (loc, cb) => {
        io.emit('message', `Shared location: https://google.com/maps?q=${loc.latitude},${loc.longitude}`);
        cb();
    });

    socket.on('disconnect', () => {
        socket.broadcast.emit('message', 'A user has disconnected.');
    });
});


server.listen(port, () => {
    console.log(`Server is running on port ${port}...`);
    if (port === '3333') console.log(`if running dev http://localhost:${port}/`);
});