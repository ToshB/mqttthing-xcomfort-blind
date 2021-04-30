"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.init = void 0;
var PositionStateValue;
(function (PositionStateValue) {
    PositionStateValue[PositionStateValue["Closing"] = 0] = "Closing";
    PositionStateValue[PositionStateValue["Opening"] = 1] = "Opening";
    PositionStateValue[PositionStateValue["Stopped"] = 2] = "Stopped";
})(PositionStateValue || (PositionStateValue = {}));
function init(params) {
    var log = params.log, config = params.config, publish = params.publish, notify = params.notify;
    log("Initializing xComfort Shutter Codec for " + config.name + " with deviceId " + config.deviceId);
    config.type = 'windowCovering';
    config.topics = {
        getPositionState: "xcomfort/" + config.deviceId + "/get/shutter"
    };
    notify('currentPosition', 0);
    return {
        properties: {
            positionState: {
                encode: function (message) {
                    log("encode positionState: " + message);
                    switch (message) {
                        case 100:
                            return 'open';
                        case 0:
                            return 'close';
                        default:
                            return 'stop';
                    }
                },
                decode: function (message) {
                    log("getPositionState: " + message);
                    log("getPositionState2", message);
                }
            }
        },
        encode: function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            log('encode', args);
            return args[0];
        },
        decode: function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            log('decode', args);
            return args[0];
        }
    };
}
exports.init = init;
