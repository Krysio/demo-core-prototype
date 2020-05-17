import bson from "bson";
import BufferWrapper from "@/libs/BufferWrapper";
import Base from "./Base";
import { Block } from "@/models/block";
import { Hash } from "@/models/hash";

/******************************/

// Dane transakcji - lista hashy
// [TYPE_CZEGO_DOTYCZY, TYPE_CZYM_WYKONANY, Buffer][]

const EMPTY = {};
export const TYPE_TXN_DB_HASHES = 3;
Base.defineType(TYPE_TXN_DB_HASHES, class TxnDbHashes extends Base {
    verify(inputs: {
        block?: Block
    } = EMPTY) {
        const data = this.getData();

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

    getDataBuffer() {
        const data = this.getData('buffer');
        const dataSize = BufferWrapper.numberToUleb128Buffer(data.length);
        return BufferWrapper.concat([dataSize, data]);
    }

    setDataFromBufferWrapper(
        bufferWrapper: BufferWrapper
    ) {
        this.setData(
            bufferWrapper.read(
                bufferWrapper.readUleb128()
            )
        );
    }
});
