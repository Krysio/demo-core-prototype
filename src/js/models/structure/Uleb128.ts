import BufferWrapper from "@/libs/BufferWrapper";
import { Base } from "@/models/structure";

/******************************/

export class Uleb128 extends Base {
    protected value: number = -1;

    readBuffer() {
        if (this.buffer.cursor === -1) {
            return this;
        }

        this.$cursorStart = this.buffer.cursor;
        this.value = this.buffer.readUleb128();
        this.$cursorEnd = this.buffer.cursor;
        return this;
    }

    toBuffer() {
        return BufferWrapper.numberToUleb128Buffer(this.value);
    }

    isValid() {
        return this.value > -1;
    }
}