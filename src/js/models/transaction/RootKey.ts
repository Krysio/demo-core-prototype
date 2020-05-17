import { Context } from "@/context";
import BufferWrapper from "@/libs/BufferWrapper";
import Base from "./Base";
import { Key } from "../key";
import { Block } from "../block";

/******************************/

const EMPTY = {};
export const TYPE_TXN_ROOT_KEY = 1;
Base.defineType(TYPE_TXN_ROOT_KEY, class TxnRootKey extends Base {
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

        const key = Key.fromBuffer(data);

        return key.verify();
    }

    read(inputs: {
        context: Context
    }) {
        const data = this.getData();

        if (data !== null) {
            inputs.context.store.keys.put(0, data);
        }
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
