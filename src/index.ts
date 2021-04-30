enum PositionStateValue {
  Closing,
  Opening,
  Stopped
}


interface Properties {
  currentPosition: number;
  targetPosition: number;
  positionState: PositionStateValue;
}

interface Topics {
  getPositionState: Properties['positionState'],
  setTargetPosition: Properties['targetPosition']
}

interface AccessoryConfig {
  name: string;
  type: string;
  topics: Partial<Record<keyof Topics, string>>;
  deviceId: number;
}

interface Params {
  log(message: string): void;
  config: AccessoryConfig;
  publish<T extends keyof Topics, M extends Topics[T]>(topic: T, message: M): void;
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
  properties?: Partial<{[K in keyof Topics]: PropCodec<Topics[K]>}>
} & (PropCodec<unknown> | {});

export function init(params: Params): Codec {
  const {log, config, publish, notify} = params;

  log(`Initializing xComfort Shutter Codec for ${config.name} with deviceId ${config.deviceId}`);

  config.type = 'windowCovering';
  config.topics = {getPositionState: `xcomfort/${config.deviceId}/get/shutter`};

  notify('currentPosition', 0);

  return {
    properties: {
      setTargetPosition: {
        encode: function (message){
          switch(message){
            case 100:
              return 'open';
            case 0:
              return 'close';
            default:
              return 'stop';
          }
        }
      },
      getPositionState:{
        decode: function (message){
          switch(message){
            case 'closing': {
              return PositionStateValue.Closing;
            }
            case 'opening': {
              return PositionStateValue.Opening;
            }
            case 'stopped': {
              return PositionStateValue.Stopped;
            }
          }
        }
      }
    }
  }

}
