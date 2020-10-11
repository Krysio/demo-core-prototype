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

  const module = {
    in(inputValue: T_in) {
      const result: any = main(inputValue);
      module.emit(result);
    },
    out(
      handler: (outputValue: T_out_unpromise) => void
    ) {
      events.on('output', handler);
    },
    emit(value: any) {
      if (value !== null && value !== undefined) {
        if (value instanceof Promise) {
          value.then(
            (value) => {
              if (value !== null && value !== undefined) {
                events.emit('output', value);
              }
            }
          );
        } else {
          events.emit('output', value);
        }
      }
    },
    api
  };

  return module;
}
