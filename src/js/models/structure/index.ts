export * from "./Base";
export * from "./typed";

export * from "./Uleb128";
export * from "./Blob";

export * from "./Hash";
export * from "./Key";
export * from "./Signature";

export * from "./Author";
export * from "./BlockIndex";
export * from "./User";
export * from "./Document";
export * from "./Transaction";

import { Base } from "./Base";
import { Uleb128 } from "./Uleb128";
import { Blob } from "./Blob";

import { Hash, BlockHash } from "./Hash";
import { Key } from "./Key";
import { Signature } from "./Signature";

import { Author } from "./Author";
import { BlockIndex } from "./BlockIndex";
import { User } from "./User";
import { HashList } from "./HashList";
import { Document } from "./Document";
import { TxnInternal, TxnStandalone } from "./Transaction";

const mapOfTypes = {
    Uleb128,
    Blob,
    Hash, BlockHash, HashList,
    Key, Signature,
    Author, BlockIndex,
    User, Document,
    TxnInternal, TxnStandalone
};

type mapOfTypesKeys = keyof typeof mapOfTypes;

export default class Structure {
    static create<Key extends mapOfTypesKeys, Type extends typeof mapOfTypes[ Key ]>(
        key: Key | typeof Base
    ) {
        let instance: Base;

        if (typeof key === 'string') {
            instance = new mapOfTypes[ key ]();
        } else {
            //@ts-ignore
            instance = new key();
        }

        instance.init();

        return instance as InstanceType<Type>;
    }
}
