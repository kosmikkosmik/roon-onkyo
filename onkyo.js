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
        sendCommand(Receiver.Commands.SetMasterVolume(volume));
    }

    this.masterVolume = null;
    receiver = this;

    events.EventEmitter.call(this);

    this.on("MVL", handleMVL);
}

Receiver.prototype.__proto__ = events.EventEmitter.prototype;
exports.Receiver = Receiver;

function handleMVL(msg) {
    receiver.emit("master-volume", parseInt(msg.parameters, 16));
}

function sendCommand(buffer) {
    console.log("->", eiscp.ReadMessage(buffer));
    receiver.socket.write(buffer);
}

function socketHandleConnected() {
    console.log("Receiver.handleConnected()");

    // sync state
    sendCommand(eiscp.Commands.GetMasterVolume());

    receiver.emit("status");
}

function socketHandleData(data) {
    let msg = eiscp.ReadMessage(data);
    receiver.emit(msg.command, msg);    
}

function socketHandleError(error)
{
    console.log("Receiver.handleError() ", error);
}

function setupVolumeControl() {
    if (!receiver.volumeControl) {
        receiver.state = {
            display_name: "Main Zone",
            volume_type: "db",
            volume_min: -80,
            volume_step: 1;
        };
    }

    var device = {
        state: receiver.state,

        set_volume: function(req, mode, value) {
            console.log("set_volume: mode=", mode, " value=", value);
            let volume = mode== "absolute" ? value : state.volume_value + value;
            if (volume < this.state.volume_min) {
                volume = this.state.volume_min;
            }
            else if (volume > this.state_volume_max) {
                volume = this.state.volume_max;
            }
            
            sendCommand(eiscp.Commands.SetMasterVolume(volume));
        }
    }
}
