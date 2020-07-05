import BufferWrapper from "@/libs/BufferWrapper";
import { Base } from "./base/Base";

/******************************/

export class Uleb128 extends Base<number> {
    protected value = -1;

    public fromBuffer(buffer: BufferWrapper) {
        this.value = buffer.readUleb128();
        return this;
    }
    public toBuffer() {
        return BufferWrapper.numberToUleb128Buffer(this.value);
    }
    public isValid() {
        return this.value > -1;
    }
}
