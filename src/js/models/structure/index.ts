export * from "./Base";
export * from "./typed";

export * from "./Uleb128";
export * from "./User";
export * from "./Blob";
export * from "./Signature";
export * from "./BlockHash";
export * from "./Transaction";

import { Uleb128 } from "./Uleb128";

export class BlockIndex extends Uleb128 {}
export class Author extends Uleb128 {}
