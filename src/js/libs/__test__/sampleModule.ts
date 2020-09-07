export type inType = Buffer;
export type outType = string;

export function main(inputValue: inType): outType {
  return inputValue.toString('hex');
}

export const api = {
  test: () => 'ABCDEF'
};
