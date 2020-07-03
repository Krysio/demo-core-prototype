import BufferWrapper from "@/libs/BufferWrapper";
import { Base } from "./Base";

/******************************/

export class Blob extends Base<BufferWrapper> {
    protected size = 0;

    public fromBuffer(buffer: BufferWrapper) {
        this.size = buffer.readUleb128();
        this.value = buffer.read(this.size);
        return this;
    }
    public toBuffer() {
        return BufferWrapper.concat([
            BufferWrapper.numberToUleb128Buffer(this.value.length),
            this.value
        ]);
    }

    public setValue(value: BufferWrapper) {
        this.value = value;
        this.size = value.length;

        return this;
    }

    public isValid() {
        return this.value.length === this.size;
    }

    public getSize() {
        return this.size;
    }
}
