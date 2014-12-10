importScripts("/socket.io/socket.io.js");

var socket = io.connect('/');

onmessage = function(e){
    socket.emit('frame', e.data);
}
