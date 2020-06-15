import BufferWrapper from "@/libs/BufferWrapper";
import { Base } from "@/models/structure";

/******************************/

export class BlockHash extends Base {
    protected value: BufferWrapper;

    toBuffer() {
        return BufferWrapper.concat([
            BufferWrapper.numberToUleb128Buffer(this.value.length),
            this.value
        ]);
    }

    readBuffer() {
        this.$cursorStart = this.buffer.cursor;

        this.value = this.buffer.read(32);

        this.$cursorEnd = this.buffer.cursor;
        return this;
    }

    isValid() {
        return this.value.length === 32;
    }
}
