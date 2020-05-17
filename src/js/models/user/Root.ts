import Base from "./Base";
import BufferWrapper from "@/libs/BufferWrapper";

/******************************/

export const TYPE_USER_ROOT = 0;
Base.defineType(TYPE_USER_ROOT, class UserRoot extends Base {
    verify() {
        const key = this.getKey();
        return key.verify();
    }

    getDataBuffer() {
        const key = this.getKey('buffer');
        return BufferWrapper.concat([
            BufferWrapper.numberToUleb128Buffer(key.length),
            key
        ]);
    }

    setDataFromBufferWrapper(
        buff: BufferWrapper
    ) {
        this.setKey(buff.read(buff.readUleb128()));
    }
});
