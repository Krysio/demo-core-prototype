import { createNode } from "../Node";

export default function(context: {}) {
  return createNode((inputValue: Buffer) => {
    return inputValue.toString('hex');
  }, {
    test() { return 'ABCDEF'; }
  });
}
