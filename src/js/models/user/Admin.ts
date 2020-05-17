import Base from "./Base";
import BufferWrapper from "@/libs/BufferWrapper";
import { Block } from "@/models/block";

/******************************/

const EMPTY = {};
const EmptyBuffer = Buffer.alloc(0);

/******************************/

export const TYPE_USER_ADMIN = 1;
export class UserAdmin extends Base {
    protected type = TYPE_USER_ADMIN;
    protected level = 0;

    //#region set-get

    getLevel(): number;
    getLevel(format: 'buffer'): BufferWrapper;
    getLevel(format?: 'buffer') {
        if (format) {
            return BufferWrapper.numberToUleb128Buffer(this.level);
        }
        return this.level;
    }
    setLevel(value: number) {
        this.level = value;
        return this;
    }

    //#endregion
    //#region logical

    verify(inputs: {
        block?: Block
    } = EMPTY) {
        if (this.getLevel() <= 0) {
            return false;
        }
        const key = this.getKey();
        return key.verify();
    }

    //#endregion
    //#region import-export buffer

    getBufferStructure() {
        const buffKey = this.getKey('buffer');

        return [
            this.getType('buffer'),
            this.getLevel('buffer'),
            BufferWrapper.numberToUleb128Buffer(buffKey.length),
            buffKey
        ];
    }

    setDataFromBufferWrapper(
        buff: BufferWrapper
    ) {
        this.setLevel(buff.readUleb128());
        this.setKey(buff.read(buff.readUleb128()));
    }

    //#endregion
}
export default {
    [TYPE_USER_ADMIN]: UserAdmin
};
