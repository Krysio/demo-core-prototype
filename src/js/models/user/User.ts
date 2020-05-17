import Base from "./Base";
import BufferWrapper from "@/libs/BufferWrapper";

/******************************/

export const STATE_USER_INACTIVE = 0;
export const STATE_USER_ACTIVE = 1;
export const STATE_USER_SUSPEND = 2;

type UserState =
    typeof STATE_USER_INACTIVE |
    typeof STATE_USER_ACTIVE |
    typeof STATE_USER_SUSPEND;

/******************************/

export const TYPE_USER_USER = 2;
export class UserUser extends Base {
    protected type = TYPE_USER_USER;
    protected state = STATE_USER_INACTIVE;
    protected timeStart = 0;
    protected timeEnd = 0;

    //#region set-get

    getState(): UserState;
    getState(format: 'buffer'): BufferWrapper;
    getState(format?: 'buffer') {
        if (format === 'buffer') {
            return BufferWrapper.numberToUleb128Buffer(this.state);
        }
        return this.state;
    }
    setState(value: UserState) {
        this.state = value;
    }

    //#endregion
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
    [TYPE_USER_USER]: UserUser
};