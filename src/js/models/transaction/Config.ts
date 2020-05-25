import { Context } from "@/context";
import BufferWrapper from "@/libs/BufferWrapper";
import { TxnTypeInternal } from "./Base";
import { Config } from "../Config";
import { Block } from "../block";

/******************************/

const EMPTY = {};
export const TYPE_TXN_SET_CONFIG = 2;
export class TxnSetConfig extends TxnTypeInternal {
    protected type = TYPE_TXN_SET_CONFIG;

    //#region logical

    async verifyPrepareInputs(
        context: Context,
        block: Block
    ) {
        return { block };
    }

    verify(inputs: {
        block?: Block
    } = EMPTY) {
        const data = this.getData('buffer');

        if (inputs.block
            && inputs.block.getIndex() !== 0
        ) {
            return false;
        }

        const config = Config.fromBuffer(data);

        return config.isValid();
    }

    read(
        context: Context
    ) {
        const data = this.getData('buffer');

        if (data !== null) {
            const config = Config.fromBuffer(data);

            context.setConfig(config);
        }
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
    [TYPE_TXN_SET_CONFIG]: TxnSetConfig
}
