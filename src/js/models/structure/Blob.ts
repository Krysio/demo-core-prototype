import BufferWrapper from "@/libs/BufferWrapper";
import { Base } from "@/models/structure";

/******************************/

export class Blob extends Base {
    protected value: BufferWrapper;
    protected size = 0;

    toBuffer() {
        return BufferWrapper.concat([
            BufferWrapper.numberToUleb128Buffer(this.value.length),
            this.value
        ]);
    }

    readBuffer() {
        this.$cursorStart = this.buffer.cursor;

        this.size = this.buffer.readUleb128();
        this.value = this.buffer.read(this.size);

        this.$cursorEnd = this.buffer.cursor;
        return this;
    }

    setValue(value: BufferWrapper) {
        this.value = value;
        this.size = value.length;

        return this;
    }

    isValid() {
        return this.value.length === this.size;
    }
}
