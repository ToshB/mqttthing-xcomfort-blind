function notUndefined(value) {
    return typeof value !== 'undefined';
}
function init(params) {
    var log = params.log, config = params.config, publish = params.publish, notify = params.notify;
    var targetPosition = 100;
    var currentPosition = 100;
    var currentState = 'stopped';
    log("Initializing xComfort Shutter Codec for " + config.name + " with topic base " + config.topicBase);
    config.type = 'windowCovering';
    config.positionStateValues = ['closing', 'opening', 'stopped'];
    config.topics = {
        getPositionState: config.topicBase + "/get/shutter",
        getTargetPosition: config.topicBase + "/get/target",
        setTargetPosition: config.topicBase + "/set/target",
        getCurrentPosition: config.topicBase + "/get/current"
    };
    setTimeout(function () {
        notify('targetPosition', targetPosition);
        notify('currentPosition', currentPosition);
        notify('positionState', currentState);
    }, 0);
    return {
        properties: {
            targetPosition: {
                encode: function (message) {
                    if (message === 100) {
                        targetPosition = 100;
                        publish(config.topicBase + "/set/shutter", 'open');
                    }
                    else if (message === 0) {
                        targetPosition = 0;
                        publish(config.topicBase + "/set/shutter", 'close');
                    }
                    else {
                        targetPosition = 50;
                        publish(config.topicBase + "/set/shutter", 'stop');
                    }
                    notify('targetPosition', targetPosition);
                }
            },
            positionState: {
                decode: function (message) {
                    if (message == 'opening') {
                        targetPosition = 100;
                        notify('targetPosition', targetPosition);
                    }
                    else if (message == 'closing') {
                        targetPosition = 0;
                        notify('targetPosition', targetPosition);
                    }
                    else if (message == 'stopped') {
                        notify('currentPosition', targetPosition);
                        currentPosition = targetPosition;
                    }
                    currentState = message;
                    return message;
                }
            }
        },
        encode: function (message) {
            return message;
        },
        decode: function (message) {
            return message;
        }
    };
}
module.exports = {
    init: init
};
