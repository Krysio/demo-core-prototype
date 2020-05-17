import Base from "./Base";
import BufferWrapper from "@/libs/BufferWrapper";

/******************************/

export const TYPE_USER_ROOT = 0;
export class UserRoot extends Base {
    protected type = TYPE_USER_ROOT;

    getLevel() {return 0;}

    //#region logical

    verify() {
        const key = this.getKey();
        return key.verify();
    }

    //#endregion
    //#region import-export buffer

    getBufferStructure() {
        const buffKey = this.getKey('buffer');
        return [
            this.getType('buffer'),
            BufferWrapper.numberToUleb128Buffer(buffKey.length),
            buffKey
        ];
    }

    setDataFromBufferWrapper(
        buff: BufferWrapper
    ) {
        this.setKey(buff.read(buff.readUleb128()));
    }

    //#endregion
}
export default {
    [TYPE_USER_ROOT]: UserRoot
};
