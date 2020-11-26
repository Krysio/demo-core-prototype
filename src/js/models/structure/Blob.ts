import BufferWrapper from "@/libs/BufferWrapper";
import { Base } from "./base";

/******************************/

const emptyBuffer = BufferWrapper.alloc(0);

/******************************/

export class Blob extends Base<BufferWrapper> {
    protected value = emptyBuffer;
    protected blobSize = null as null | number;
    protected size = 0;

    public fromBuffer(buffer: BufferWrapper) {
        if (this.blobSize === null) {
            this.size = buffer.readUleb128();
            this.value = buffer.read(this.size);
        } else {
            this.size = this.blobSize;
            this.value = buffer.read(this.blobSize);
        }
        return this;
    }

    public toBuffer() {
        if (this.blobSize === null) {
            return BufferWrapper.concat([
                BufferWrapper.numberToUleb128Buffer(this.value.length),
                this.value
            ]);
        } else {
            return this.value;
        }
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

const negativeFilter = (blob: Blob) => !blob.isValid();
export class ArrayOfBlob extends Base<Blob[]> {
    protected value = null as Blob[];

    public fromBuffer(buffer: BufferWrapper) {
        const length = buffer.readUleb128();

        this.value = [];
        for (let i = 0; i < length; i++) {
            this.value.push(
                (new Blob()).init().fromBuffer(buffer)
            );
        }
        return this;
    }

    public toBuffer() {
        if (this.isValid() === false) {
            throw new Error();
        }
        const toConcat = [
            BufferWrapper.numberToUleb128Buffer(this.value.length)
        ];
        for (let blob of this.value) {
            toConcat.push(blob.toBuffer());
        }
        return BufferWrapper.concat(toConcat);
    }
    
    public isValid() {
        return this.value !== null && this.value.filter(negativeFilter).length === 0;
    }
}