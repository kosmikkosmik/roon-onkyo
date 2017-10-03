const EISCP_HEADER = new Buffer("ISCP", "ascii");

function ReadMessage(buffer) {    
    var pos = 0;

    if (!beginsWith(buffer, EISCP_HEADER, pos)) {
        console.log("Message doesn't start with header ", EISCP_HEADER);
        return null;
    }
    pos += EISCP_HEADER.length;

    var msg = {
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

    var dataPos = msg.headerSize;
    if (buffer.readInt8(dataPos) !== "!".charCodeAt(0)) {
        console.log("Data doesn't start with '!'");
        return null;
    }
    dataPos++;

    msg.destinationUnitType = String.fromCharCode(buffer.readInt8(dataPos));
    dataPos++;
    
    msg.command = buffer.slice(dataPos, dataPos + 3).toString("ascii");

    var paramStartPos = dataPos + 3;
    var paramEndPos = paramStartPos + msg.dataSize - 8; 
    msg.parameters = buffer.slice(paramStartPos, paramEndPos).toString("ascii");
    
    console.log("eISCP: ", msg);
    return msg;
}

function beginsWith(buffer, string, pos) {
    var stringLen = string.length;
    if (buffer.length + pos < stringLen) {
        return false;
    }

    for (var i = 0; i < stringLen; i++) {
        if (buffer.readInt8(pos + i) !== string.readInt8(i)) {
            return false;
        }
    }

    return true;
}

exports.ReadMessage = ReadMessage;

function CreateCommand(command, parameters) {
    var
}

function SetMasterVolume(volume) {

}

exports.Commands = {
    SetMasterVolume: SetMasterVolume;
};
