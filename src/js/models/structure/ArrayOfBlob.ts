import BufferWrapper from "@/libs/BufferWrapper";
import { Base } from "@/models/structure";

/******************************/

export class ArrayOfBlob extends Base {
    protected value: BufferWrapper[];
    protected size = 0;

    toBuffer() {
        return BufferWrapper.concat([
            BufferWrapper.numberToUleb128Buffer(this.value.length),
            BufferWrapper.concat(this.value.map((item) => {
                return BufferWrapper.concat([
                    BufferWrapper.numberToUleb128Buffer(item.length),
                    item
                ]);
            }))
        ]);
    }

    readBuffer() {
        this.$cursorStart = this.buffer.cursor;

        this.value = [];
        this.size = this.buffer.readUleb128();
        for (let i = 0; i < this.size; i++) {
            this.value.push(this.buffer.read(this.buffer.readUleb128()));
        }

        this.$cursorEnd = this.buffer.cursor;
        return this;
    }

    setValue(value: BufferWrapper[]) {
        this.value = value;
        this.size = value.length;

        return this;
    }
}
