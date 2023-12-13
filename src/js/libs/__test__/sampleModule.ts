import { createModule } from "../Module";

export default function(context: {}) {
  return createModule((inputValue: Buffer) => {
    return inputValue.toString('hex');
  }, {
    test() { return 'ABCDEF'; }
  });
}
