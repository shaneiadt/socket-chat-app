const path = require("path");
const http = require('http');
const express = require("express");

const app = express();
const server = http.createServer(app);
const io = require('socket.io')(server);

const port = process.env.PORT;
const hbs = require("hbs");

const publicFolder = path.join(__dirname, '../public');
const viewsPath = path.join(__dirname, '../templates/views');
const partialsPath = path.join(__dirname, '../templates/partials');

app.set('view engine', 'hbs');
app.set('views', viewsPath);

hbs.registerPartials(partialsPath);
app.use(express.static(publicFolder));

app.get('', (req, res) => {
    res.render('index', {
        title: 'Socket-To-Me'
    });
});

io.on('connection', socket => {
    socket.emit('message', 'Welcome!');
    socket.broadcast.emit('message', 'A new user has joined!');

    socket.on('message', msg => {
        io.emit('message', msg);
    });

    socket.on('location', loc => {
        io.emit('message', `Shared location: https://google.com/maps?q=${loc.latitude},${loc.longitude}`);
    });

    socket.on('disconnect', () => {
        socket.broadcast.emit('message', 'A user has disconnected.');
    });
});


server.listen(port, () => {
    console.log(`Server is running on port ${port}...`);
    if (port === '3333') console.log(`if running dev http://localhost:${port}/`);
});