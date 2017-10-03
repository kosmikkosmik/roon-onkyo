var RoonApi = require("node-roon-api"),
    RoonApiVolumeControl = require("node-roon-api-volume-control"),
    RoonApiSettings = require("node-roon-api-settings"),
    RoonApiStatus = require("node-roon-api-status"),
    Onkyo = require("./onkyo.js");

var roon = new RoonApi({
    extension_id:        'com.rk.onkyo',
    display_name:        "Onkyo AVR extension",
    display_version:     "1.0.0",
    publisher:           'Konstantin Romanov',
    email:               'kosmik@outlook.com',
    website:             'https://github.com/kosmikkosmik/roon-onkyo'
});

var appSettings = roon.load_config("settings") || {
    hostname: "",
};


function make_layout(settings) {
    var l = {
        values:    settings,
        layout:    [],
        has_error: false
    };

    l.layout.push({
        type:      "string",
        title:     "Host name or IP Address",
        subtitle:  "The IP address or hostname of the Onkyo receiver.",
        maxlength: 256,
        setting:   "hostname",
    });

    return l;
}


var svc_settings = new RoonApiSettings(roon, {
    get_settings: function(cb) {
        cb(make_layout(appSettings));
    },
    save_settings: function(req, isdryrun, settings) {
        console.log("Saving settings.");
        let l = make_layout(settings.values);
        req.send_complete(l.has_error ? "NotValid" : "Success", { settings: l });

        if (!isdryrun && !l.has_error) {
            var old_hostname = appSettings.hostname;
            appSettings = l.values;
            svc_settings.update_settings(l);
            if (old_hostname != appSettings.hostname) {
                console.log("Hostname changed, reconnecting.");
                setup_receiver_connection(appSettings.hostname);
            }
            roon.save_config("settings", appSettings);
        }
    }
});

var svc_status = new RoonApiStatus(roon);
var svc_volume_control = new RoonApiVolumeControl(roon);

var receiver = {};

var handleStatusChanged = function() {
    console.log("AVR status changed");
}

var handleMasterVolume = function(volume) {
    console.log("Master volume: ", volume);
}

function setup_receiver_connection(hostname) {
    receiver = new Onkyo.Receiver(appSettings.hostname);
    receiver.handleStatusChanged = handleStatusChanged;
    receiver.on("master-volume", handleMasterVolume);
    console.log(receiver);
    receiver.connect();
}

console.log("Initializing services.");

roon.init_services({
    provided_services: [ svc_status, svc_settings, svc_volume_control ]
});

console.log("Starting discovery.");
roon.start_discovery();

setup_receiver_connection(appSettings.hostname);
