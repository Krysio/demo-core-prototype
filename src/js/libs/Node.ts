import { EventEmitter } from "events";
import { types } from "@babel/core";

type moduleStruct<T_in, T_out> = {
  main: (T_in) => T_out,
  api?: {[key: string]: (...any) => any}
};

export function createNode<T_in, T_out>(
  name: string,
  module: moduleStruct<T_in, T_out>
) {
  const events = new EventEmitter();

  return {
    in(inputValue: T_in) {
      events.emit('output', module.main(inputValue));
    },
    out(
      handler: (outputValue: T_out) => void
    ) {
      events.on('output', handler);
    },
    api: module.api
  };
}
