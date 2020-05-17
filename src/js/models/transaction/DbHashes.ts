import BufferWrapper from "@/libs/BufferWrapper";
import { TxnTypeInternal } from "./Base";
import { Block } from "@/models/block";
import { Hash } from "@/models/hash";

/******************************/

// Dane transakcji - lista hashy
// [TYPE_CZEGO_DOTYCZY, TYPE_CZYM_WYKONANY, Buffer][]

const EMPTY = {};
export const TYPE_TXN_DB_HASH_LIST = 3;
export class TxnDbHashList extends TxnTypeInternal {
    protected type = TYPE_TXN_DB_HASH_LIST;

    //#region logical

    verify(inputs: {
        block?: Block
    } = EMPTY) {
        const data = this.getData('buffer');

        if (data === null) {
            return false;
        }
        if (inputs.block
            && inputs.block.getIndex() !== 0
        ) {
            return false;
        }

        const txnData = this.getData();

        // TODO ustalić wymagane hashe do zapisywania
        if (txnData.length < 1) {
            return false;
        }

        return true;
    }

    read() {}

    //#endregion
    //#region set-get

    getData(): [number, Hash][];
    getData(format: 'buffer'): BufferWrapper;
    getData(format?: 'buffer') {
        if (format) {
            return this.data || Buffer.alloc(0);
        } else {
            const list = BufferWrapper.create(this.data).seek(0).readUleb128ArrayOfBuffer();
            const encoded = [] as [number, Hash][];

            for (let item of list) {
                const buff = BufferWrapper.create(item).seek(0);

                encoded.push([
                    buff.readUleb128(),
                    Hash.fromBuffer(buff.slice(buff.cursor))
                ]);
            }

            return encoded;
        }
    }
    setData(value: Buffer | [number, Hash][]) {
        if (value instanceof Buffer) {
            this.data = value;
        } else {
            const encoded = [];

            for (let item of value) {
                const [ key, hash ] = item;
                encoded.push(BufferWrapper.concat([
                    BufferWrapper.numberToUleb128Buffer(key),
                    hash.toBuffer()
                ]));
            }

            this.data = BufferWrapper.arrayOfBufferToUleb128Buffer(encoded);
        }
        return this;
    }

    //#endregion
    //#region import-export buffer

    getBufferStructure() {
        const buffData = this.getData('buffer');

        return [
            this.getType('buffer'),
            BufferWrapper.numberToUleb128Buffer(buffData.length),
            buffData
        ];
    }

    setDataFromBufferWrapper(
        bufferWrapper: BufferWrapper
    ) {
        this.setData(bufferWrapper.read(bufferWrapper.readUleb128()));
    }

    //#endregion
}
export default {
    [TYPE_TXN_DB_HASH_LIST]: TxnDbHashList
}
