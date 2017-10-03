const EISCP_HEADER_STRING = "ISCP";
const EISCP_HEADER = new Buffer(EISCP_HEADER_STRING, "ascii");
const EISCP_HEADER_SIZE = 16;
const EISCP_VERSION = 1;

function ReadMessage(buffer) {    
    let pos = 0;

    if (!beginsWith(buffer, EISCP_HEADER, pos)) {
        console.log("Message doesn't start with header ", EISCP_HEADER_STR);
        return null;
    }
    pos += EISCP_HEADER.length;

    let msg = {
        headerSize: 0,
        dataSize: 0,        
        version: 0,
        destinationUnitType: null,
        command: null,
        parameters: null
    };

    msg.headerSize = buffer.readInt32BE(pos);
    pos += 4;

    msg.dataSize = buffer.readInt32BE(pos);
    pos += 4;

    msg.version = buffer.readInt8(pos);

    let dataPos = msg.headerSize;
    if (buffer.readInt8(dataPos) !== "!".charCodeAt(0)) {
        console.log("Data doesn't start with '!'");
        return null;
    }
    dataPos++;

    msg.destinationUnitType = String.fromCharCode(buffer.readInt8(dataPos));
    dataPos++;
    
    msg.command = buffer.slice(dataPos, dataPos + 3).toString("ascii");

    let paramStartPos = dataPos + 3;
    let paramEndPos = paramStartPos + msg.dataSize - 8; 
    msg.parameters = buffer.slice(paramStartPos, paramEndPos).toString("ascii");
    
    console.log("eISCP: ", msg);
    return msg;
}

function beginsWith(buffer, string, pos) {
    let stringLen = string.length;
    if (buffer.length + pos < stringLen) {
        return false;
    }

    for (let i = 0; i < stringLen; i++) {
        if (buffer.readInt8(pos + i) !== string.readInt8(i)) {
            return false;
        }
    }

    return true;
}

exports.ReadMessage = ReadMessage;

function CreateCommand(command, parameters) {
    console.log("CreateCommand(", command, ",", parameters, ")");

    let cmdString = "!1" + command + parameters + String.fromCharCode(0x1A, 0x0D, 0x0A);
    let dataSize = cmdString.length;

    let buffer = Buffer.alloc(EISCP_HEADER_SIZE + dataSize, 0); 
    buffer.write(EISCP_HEADER_STRING, 0, EISCP_HEADER_STRING.length, "ascii");
    buffer.writeInt32BE(EISCP_HEADER_SIZE, 4);
    buffer.writeInt32BE(dataSize, 8);
    buffer.writeInt8(EISCP_VERSION, 12);
    buffer.write(cmdString, EISCP_HEADER_SIZE, cmdString.length, "ascii");

    console.log(buffer);
    return buffer;
}

function SetMasterVolume(volume) {
    if (volume < 0) {
        console.log("SetMasterVolume() : volume is too low");
        return null;
    }

    if (volume > 100) {
        console.log("SetMasterVolume() : volume is too low");
        return null;
    }
    
    return  CreateCommand("MVL", volume);
}


var EISCPCommands = {
    SetMasterVolume: function(volume) {
        if (volume < 0) {
            console.log("SetMasterVolume() : volume is too low");
            return null;
        }
    
        if (volume > 100) {
            console.log("SetMasterVolume() : volume is too low");
            return null;
        }
        
        return  CreateCommand("MVL", volume);
    },

    GetMasterVolume: function() {
        return CreateCommand("MVL", "QSTN");
    }
}

exports.Commands = EISCPCommands;
