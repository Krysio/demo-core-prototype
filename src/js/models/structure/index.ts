export * from "./Base";
export * from "./typed";

export * from "./Uleb128";
export * from "./User";
export * from "./Blob";
export * from "./Hash";
export * from "./Key";
export * from "./Signature";
export * from "./Transaction";

import { Uleb128 } from "./Uleb128";

export class BlockIndex extends Uleb128 {}
export class Author extends Uleb128 {}
