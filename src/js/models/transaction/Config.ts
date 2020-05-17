import { Context } from "@/context";
import BufferWrapper from "@/libs/BufferWrapper";
import Base from "./Base";
import { Config } from "../Config";
import { Block } from "../block";

/******************************/

const EMPTY = {};
export const TYPE_TXN_CONFIG = 2;
Base.defineType(TYPE_TXN_CONFIG, class TxnConfig extends Base {
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

        const config = Config.fromBuffer(data);

        return config.isValid();
    }

    read(inputs: {
        context: Context
    }) {
        const data = this.getData();

        if (data !== null) {
            const config = Config.fromBuffer(data);

            inputs.context.setConfig(config);
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
