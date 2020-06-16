import BufferWrapper from "@/libs/BufferWrapper";
import { Base, BaseStructure, defineTypes, Uleb128 } from "@/models/structure";

/******************************/

export const TYPE_HASH_Sha256 = 0;

/******************************/

export class Hash extends BaseStructure {
    protected schema = {
        'type': defineTypes({
            [TYPE_HASH_Sha256]: class HashSha256 extends Hash {
                protected schema = {
                    'data': Sha256
                };
            }
        })
    };
}

export class Sha256 extends Base {
    protected value: BufferWrapper;

    toBuffer() {
        return this.value;
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

export { Sha256 as BlockHash }
