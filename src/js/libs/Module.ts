import { EventEmitter } from "events";

export function createModule<
  T_in extends any,
  T_out extends any,
  T_out_unpromise extends T_out extends Promise<infer T_out_pv> ? T_out_pv : T_out,
  T_api extends { [Key in keyof T_api]: T_api[Key] }
>(
  main: (inputValue: T_in) => T_out,
  api?: T_api 
) {
  const events = new EventEmitter();

  return {
    in(inputValue: T_in) {
      const result = main(inputValue);

      if (result !== null && result !== undefined) {
        if (result instanceof Promise) {
          result.then(
            (result) => {
              if (result !== null && result !== undefined) {
                events.emit('output', result);
              }
            }
          );
        } else {
          events.emit('output', result);
        }
      }
    },
    out(
      handler: (outputValue: T_out_unpromise) => void
    ) {
      events.on('output', handler);
    },
    api
  };
}
