export * from "./base";

export * from "./Uleb128";
export * from "./Blob";

export * from "./Hash";
export * from "./Key";
export * from "./Signature";

export * from "./Author";
export * from "./BlockIndex";
export * from "./User";
export * from "./Document";
export * from "./txn";
export * from "./Transaction";

import { Uleb128 } from "./Uleb128";
import { Blob } from "./Blob";

import { Hash, BlockHash } from "./Hash";
import { Key } from "./Key";
import { Signature } from "./Signature";

import { Author } from "./Author";
import { BlockIndex } from "./BlockIndex";
import { User, ProtoShadowUser } from "./User";
import { HashList } from "./HashList";
import { Document } from "./Document";
import { TxnInternal, TxnStandalone } from "./Transaction";

const typeMap = {
    Uleb128, Blob,
    Hash, BlockHash, HashList,
    Key, Signature,
    Author, BlockIndex,
    User, ProtoShadowUser, Document,
    TxnInternal, TxnStandalone
};
type TypeMap = typeof typeMap;
export default class Structure {
    static create<K extends keyof typeof typeMap, Type extends TypeMap[K]>(key: K) {
        //@ts-ignore
        const instance = new typeMap[key]();

        instance.init();
        //@ts-ignore
        return instance as InstanceType<Type>;
    }
}
