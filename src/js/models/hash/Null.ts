import Base from "./Base";
import BufferWrapper from "@/libs/BufferWrapper";

/******************************/

export const TYPE_HASH_NULL = 0;
Base.defineType(TYPE_HASH_NULL, class NullKey extends Base {
    verify() {
        if (this.getData() !== null) {
            return false;
        }
        return true;
    }
    setDataFromBufferWrapper(
        bufferWrapper: BufferWrapper
    ) {
        this.setData(null);
    }
});
