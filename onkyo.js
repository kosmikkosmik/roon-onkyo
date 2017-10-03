var net = require('net');
var eiscp = require("./eiscp.js");
var events = require("events");

const DEFAULT_PORT = 60128
exports.DEFAULT_PORT = DEFAULT_PORT;

var receiver = {};


function Receiver(host, port)
{
    if (port == null) {
        port = DEFAULT_PORT;
    }

    console.log("Receiver(", host, ",", port, ")");

    this.connect = function () {
        console.log("Receiver.connect()");

        this.socket = net.Socket();
        this.socket.connect(port, host, socketHandleConnected);
        this.socket.on("data", socketHandleData);
        this.socket.on("error", socketHandleError);
    }

    this.disconnect = function () {
        console.log("Receiver.disconnect()");

        receiver.socket.destroy();
    }

    this.setMasterVolume = function(volume) {
        console.log("Setting master volume to " , volume);
        
    }

    receiver = this;
    events.EventEmitter.call(this);
    this.on("MVL", handleMVL);
}

Receiver.prototype.__proto__ = events.EventEmitter.prototype;
exports.Receiver = Receiver;

function handleMVL(msg) {
    receiver.emit("master-volume", parseInt(msg.parameters, 16));
}

function socketHandleConnected() {
    console.log("Receiver.handleConnected()");

    receiver.handleStatusChanged();
}

function socketHandleData(data) {
    var msg = eiscp.ReadMessage(data);
    receiver.emit(msg.command, msg);    
}

function socketHandleError(error)
{
    console.log("Receiver.handleError() ", error);
}
