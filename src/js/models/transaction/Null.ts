import Base from "./Base";
import BufferWrapper from "@/libs/BufferWrapper";

/******************************/

export const TYPE_TXN_NULL = 0;
export class TxnNull extends Base {
    protected type = TYPE_TXN_NULL;

    //#region logical

    verify() {
        if (process.env.NODE_ENV === 'production') {
            return false;
        }
        return true;
    }
    read() {}

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
    [TYPE_TXN_NULL]: TxnNull
}
