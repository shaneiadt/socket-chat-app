const path = require("path");
const http = require('http');
const express = require("express");
const Filter = require('bad-words');
const { generateMessage, generateLocationMessage } = require('./utils/messages');
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = require('socket.io')(server);

const port = process.env.PORT;

const publicFolder = path.join(__dirname, '../public');
app.use(express.static(publicFolder));

io.on('connection', socket => {

    socket.on('message', (msg, cb) => {
        const user = getUser(socket.id);

        if (!user) return cb({ error: 'Cannot find user' });

        const filter = new Filter();

        if (filter.isProfane(msg)) return cb('Profanity is not allowed');

        io.to(user.room).emit('message', generateMessage(user.username, msg));
        cb('delievered');
    });

    socket.on('locationMessage', (loc, cb) => {
        const user = getUser(socket.id);

        if (!user) return cb({ error: 'Cannot find user' });

        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, `https://google.com/maps?q=${loc.latitude},${loc.longitude}`));
        cb();
    });

    socket.on('join', ({ username, room }, cb) => {
        const { error, user } = addUser({
            id: socket.id,
            username,
            room
        });

        if (error) return cb(error);

        socket.join(user.room);
        socket.emit('message', generateMessage('Admin', 'Welcome'));
        socket.broadcast.to(user.room).emit('message', generateMessage('Admin', `${user.username} has joined!`));

        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        });

        cb();
    });

    socket.on('disconnect', () => {
        const user = removeUser(socket.id);

        if (!user) return;

        socket.broadcast.to(user.room).emit('message', generateMessage('Admin', `${user.username} has left.`));

        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        });
    });
});


server.listen(port, () => {
    console.log(`Server is running on port ${port}...`);
    if (port === '3333') console.log(`if running dev http://localhost:${port}/`);
});