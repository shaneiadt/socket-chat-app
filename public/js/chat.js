const socket = io();

socket.on('message', msg => console.log(msg));

const form = document.querySelector('#chat-form');
form.addEventListener('submit', function (e) {
    e.preventDefault();

    const message = this.elements.message.value;

    socket.emit('message', message);
});

document.querySelector('#share-location').addEventListener('click', () => {
    if (!navigator.geolocation) return alert('Geolocation is not supported by your browser.');

    navigator.geolocation.getCurrentPosition(pos => {
        const { latitude, longitude } = pos.coords;
        socket.emit('location', { latitude, longitude });
    }, e => console.error(e));
});