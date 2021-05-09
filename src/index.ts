type PositionStateValue = 'opening' | 'closing' | 'stopped';

function notUndefined<T>(value: T | undefined) : value is T {
  return typeof value !== 'undefined';
}

interface Properties {
  currentPosition: number;
  targetPosition: number;
  positionState: PositionStateValue;
}

interface Topics {
  getPositionState: Properties['positionState'],
  setTargetPosition: Properties['targetPosition'],
  getTargetPosition: Properties['targetPosition']
  getCurrentPosition: Properties['currentPosition']
}

interface AccessoryConfig {
  name: string;
  type: string;
  positionStateValues: PositionStateValue[];
  topics: Partial<Record<keyof Topics, string>>;
  topicBase: string;
}

interface Params {
  log(message: string): void;
  config: AccessoryConfig;
  publish(topic: string, message: string | number): void;
  notify<P extends keyof Properties, M extends Properties[P]>(property: P, message: M): void;
}

interface Info {
  topic: string;
  property: keyof Properties;
}

type OutputFn = (message: string) => void

type EncoderFn<M> = (message: M, info: Info, output: OutputFn) => (string | void);
type DecoderFn<M> = (message: string, info: Info, output: OutputFn) => (M | void);

interface PropCodec<M> {
  encode?: EncoderFn<M>;
  decode?: DecoderFn<M>;
}


type Codec = {
  properties?: Partial<{[K in keyof Properties]: PropCodec<Properties[K]>}>
} & (PropCodec<any> | {});

function init(params: Params): Codec {
  const {log, config, publish, notify} = params;
  let targetPosition = 100;
  let currentPosition  = 100;
  let currentState : PositionStateValue = 'stopped';
  log(`Initializing xComfort Shutter Codec for ${config.name} with topic base ${config.topicBase}`);

  config.type = 'windowCovering';
  config.positionStateValues = ['closing', 'opening','stopped'];
  config.topics = {
    getPositionState: `${config.topicBase}/get/shutter`,
    getTargetPosition: `${config.topicBase}/get/target`,
    setTargetPosition: `${config.topicBase}/set/target`,
    getCurrentPosition: `${config.topicBase}/get/current`
  };

  setTimeout(() => {
    notify('targetPosition', targetPosition);
    notify('currentPosition', currentPosition);
    notify('positionState', currentState);
  },0);

  return {
    properties: {
      targetPosition: {
        encode: function (message) {
          if(message === 100){
            targetPosition = 100;
            publish(`${config.topicBase}/set/shutter`, 'open');
          }else if(message === 0){
            targetPosition = 0;
            publish(`${config.topicBase}/set/shutter`, 'close');
          }else{
            targetPosition = 50;
            publish(`${config.topicBase}/set/shutter`, 'stop');
          }

          notify('targetPosition', targetPosition);
        }
      },
      positionState: {
        decode: function (message: PositionStateValue){
          if(message == 'opening'){
            targetPosition = 100;
            notify('targetPosition', targetPosition);
          }else if(message == 'closing'){
            targetPosition = 0;
            notify('targetPosition', targetPosition);
          }else if(message == 'stopped'){
            notify('currentPosition', targetPosition)
            currentPosition = targetPosition;
          }

          currentState = message;
          return message;
        }
      }
    },
    encode: function(message){
      return message;
    },
    decode: function(message){
      return message;
    }
  }

}

module.exports = {
  init
}
