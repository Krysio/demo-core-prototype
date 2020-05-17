import BufferWrapper from "@/libs/BufferWrapper";

import Base from "./Base"
export { Base as TxnAny };

import TxnNull from "./Null";
export * from "./Null";
import TxnInsertRootKey from "./RootKey";
export * from "./RootKey";
import TxnSetConfig from "./Config";
export * from "./Config";
import TxnDbHashList from "./DbHashes";
export * from "./DbHashes";

const TxnTypes = {
    ...TxnNull,
    ...TxnInsertRootKey,
    ...TxnSetConfig,
    ...TxnDbHashList
};
type TxnType = keyof typeof TxnTypes;

export class Txn {
    static create<Key extends TxnType, Type extends typeof TxnTypes[Key]>(
        type: Key
    ) {
        return new TxnTypes[type]() as InstanceType<Type>;
    }
    static fromBuffer(
        inputBuff: Buffer
    ) {
        const buff = BufferWrapper.create(inputBuff).seek(0);
        const type = buff.readUleb128() as TxnType;
        const instance = this.create(type);

        instance.setDataFromBufferWrapper(buff);
        return instance;
    }
}
