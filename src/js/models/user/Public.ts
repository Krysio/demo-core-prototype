import Base from "./Base";
import BufferWrapper from "@/libs/BufferWrapper";

/******************************/

export const TYPE_USER_PUBLIC = 3;
export class UserPublic extends Base {
    protected type = TYPE_USER_PUBLIC;
    protected userId = 0;

    //#region set-get

    getUserId(): number;
    getUserId(format: 'buffer'): BufferWrapper;
    getUserId(format?: 'buffer') {
        if (format) {
            return BufferWrapper.numberToUleb128Buffer(this.userId);
        }
        return this.userId;
    }
    setUserId(value: number) {
        this.userId = value;
        return this;
    }

    //#endregion
    //#region logical

    verify() {
        /**
         * TODO
         * wartości z configa
         */
        if (this.getUserId() <= 0) {
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
            this.getUserId('buffer'),
            BufferWrapper.numberToUleb128Buffer(buffKey.length),
            buffKey
        ];
    }

    setDataFromBufferWrapper(
        buff: BufferWrapper
    ) {
        this.setUserId(buff.readUleb128());
        this.setKey(buff.read(buff.readUleb128()));
    }

    //#endregion
}
export default {
    [TYPE_USER_PUBLIC]: UserPublic
};
