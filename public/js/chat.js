const socket = io();

const form = document.querySelector('#chat-form');
const input = document.querySelector('#chat-form input');
const submitBtn = document.querySelector('#chat-form button');
const shareBtn = document.querySelector('#share-location');
const messages = document.querySelector('#messages');
const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationTemplate = document.querySelector('#location-template').innerHTML;
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;

const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true });

const autoScroll = () => {
    const newMessage = messages.lastElementChild;
    const { marginBottom } = getComputedStyle(newMessage);
    const newMessageMargin = parseInt(marginBottom);
    const newMessageHeight = newMessage.offsetHeight + newMessageMargin;
    const visibleHeight = messages.offsetHeight;
    const containerHeight = messages.scrollHeight;
    const scrollOffset = messages.scrollTop + visibleHeight;

    if (containerHeight - newMessageHeight <= scrollOffset) messages.scrollTop = messages.scrollHeight;
};

socket.on('message', message => {
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    });
    messages.insertAdjacentHTML('beforeend', html);
    autoScroll();
}, error => {
    console.error(error);
});

socket.on('roomData', ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    });
    document.querySelector('#sidebar').innerHTML = html;
}, error => {
    console.error(error);
});

socket.on('locationMessage', message => {
    const html = Mustache.render(locationTemplate, {
        username: message.username,
        url: message.url,
        createdAt: moment(message.createdAt).format('h:mm a')
    });
    messages.insertAdjacentHTML('beforeend', html);
    autoScroll();
});

form.addEventListener('submit', function (e) {
    e.preventDefault();
    const message = this.elements.message.value;
    if (!message || message === '') return;

    submitBtn.setAttribute('disabled', 'disabled');

    socket.emit('message', message, (error) => {
        submitBtn.removeAttribute('disabled');
        input.value = '';
        input.focus();
        if (error) return console.log(error);

        console.log('Message delievered successfully', m);
    });
});

shareBtn.addEventListener('click', () => {
    if (!navigator.geolocation) return alert('Geolocation is not supported by your browser.');
    shareBtn.setAttribute('disabled', 'disabled');

    navigator.geolocation.getCurrentPosition(pos => {
        const { latitude, longitude } = pos.coords;
        socket.emit('locationMessage', { latitude, longitude }, () => {
            shareBtn.removeAttribute('disabled');
            console.log('Location shared successfully');
        });
    }, e => console.error(e));
});

socket.emit('join', {
    username,
    room
}, error => {
    if (error) {
        alert(error);
        location.href = '/';
    }
});