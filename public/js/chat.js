const socket = io();

const form = document.querySelector('#chat-form');
const textarea = document.querySelector('#chat-form textarea');
const submitBtn = document.querySelector('#chat-form button');
const shareBtn = document.querySelector('#share-location');
const messages = document.querySelector('#messages');
const messageTemplate = document.querySelector('#message-template').innerHTML;

socket.on('message', message => {
    const html = Mustache.render(messageTemplate, {
        message
    });
    messages.insertAdjacentHTML('beforeend', html);
});

form.addEventListener('submit', function (e) {
    e.preventDefault();
    submitBtn.setAttribute('disabled', 'disabled');
    const message = this.elements.message.value;

    socket.emit('message', message, (error) => {
        submitBtn.removeAttribute('disabled');
        textarea.value = '';
        textarea.focus();
        if (error) return console.log(error);

        console.log('the message was delievered', m);
    });
});

shareBtn.addEventListener('click', () => {
    if (!navigator.geolocation) return alert('Geolocation is not supported by your browser.');
    shareBtn.setAttribute('disabled', 'disabled');

    navigator.geolocation.getCurrentPosition(pos => {
        const { latitude, longitude } = pos.coords;
        socket.emit('location', { latitude, longitude }, () => {
            shareBtn.removeAttribute('disabled');
            console.log('Location shared successfully');
        });
    }, e => console.error(e));
});