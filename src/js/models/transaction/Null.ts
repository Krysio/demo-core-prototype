import Base from "./Base";
import BufferWrapper from "@/libs/BufferWrapper";

/******************************/

export const TYPE_TXN_NULL = 0;
Base.defineType(TYPE_TXN_NULL, class TxnNull extends Base {
    verify() {
        if (process.env.NODE_ENV === 'production') {
            return false;
        }
        return true;
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
