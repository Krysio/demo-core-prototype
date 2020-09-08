import { EventEmitter } from "events";

export function createNode<
  T_in extends any,
  T_out extends any,
  T_api extends { [Key in keyof T_api]: T_api[Key] }
>(
  main: (inputValue: T_in) => T_out,
  api?: T_api 
) {
  const events = new EventEmitter();

  return {
    in(inputValue: T_in) {
      events.emit('output', main(inputValue));
    },
    out(
      handler: (outputValue: T_out) => void
    ) {
      events.on('output', handler);
    },
    api
  };
}
