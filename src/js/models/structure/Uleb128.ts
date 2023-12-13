import BufferWrapper from "@/libs/BufferWrapper";
import { Base } from "./base/Base";

/******************************/

export class Uleb128 extends Base<number> {
    protected value = null as number;

    public fromBuffer(buffer: BufferWrapper) {
        this.value = buffer.readUleb128();
        return this;
    }
    public toBuffer() {
        return BufferWrapper.numberToUleb128Buffer(this.value);
    }
    public isValid() {
        return this.value !== null && this.value > -1;
    }
}

const negativeFilter = (value) => parseInt(value) !== value || value < 0;
export class ArrayOfUleb128 extends Base<number[]> {
    protected value = null as number[];

    public fromBuffer(buffer: BufferWrapper) {
        const length = buffer.readUleb128();

        this.value = [];
        for (let i = 0; i < length; i++) {
            this.value.push(
                buffer.readUleb128()
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
        for (let value of this.value) {
            toConcat.push(
                BufferWrapper.numberToUleb128Buffer(value)
            );
        }
        return BufferWrapper.concat(toConcat);
    }
    public isValid() {
        return this.value !== null && this.value.filter(negativeFilter).length === 0;
    }
}
