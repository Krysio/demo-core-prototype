import Base from "./Base";
import BufferWrapper from "@/libs/BufferWrapper";

/******************************/

const SIZE = 32;
export const TYPE_HASH_Sha256 = 1;
Base.defineType(TYPE_HASH_Sha256, class HashSha256 extends Base {
    verify() {
        const data = this.getData();

        if (data === null
            || data.length !== SIZE
        ) {
            return false;
        }

        return true;
    }
    setDataFromBufferWrapper(
        bufferWrapper: BufferWrapper
    ) {
        this.setData(bufferWrapper.read(SIZE));
    }
});
