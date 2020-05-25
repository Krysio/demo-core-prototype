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

const EmptyBuffer = Buffer.alloc(0);

/******************************/

export const TYPE_USER_USER = 2;
export class UserUser extends Base {
    protected type = TYPE_USER_USER;
    protected state = STATE_USER_INACTIVE;
    protected userId = 0;
    protected level = 0;
    protected timeStart = 0;
    protected timeEnd = 0;
    protected timeSuspendEnd = 0;

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
        return this;
    }

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

    getTimeStart(): number;
    getTimeStart(format: 'buffer'): BufferWrapper;
    getTimeStart(format?: 'buffer') {
        if (format === 'buffer') {
            return BufferWrapper.numberToUleb128Buffer(this.timeStart);
        }
        return this.timeStart;
    }
    setTimeStart(value: number) {
        this.timeStart = value;
        return this;
    }

    getTimeEnd(): number;
    getTimeEnd(format: 'buffer'): BufferWrapper;
    getTimeEnd(format?: 'buffer') {
        if (format === 'buffer') {
            return BufferWrapper.numberToUleb128Buffer(this.timeEnd);
        }
        return this.timeEnd;
    }
    setTimeEnd(value: number) {
        this.timeEnd = value;
        return this;
    }

    getTimeSuspendEnd(): number;
    getTimeSuspendEnd(format: 'buffer'): BufferWrapper;
    getTimeSuspendEnd(format?: 'buffer') {
        if (format === 'buffer') {
            return BufferWrapper.numberToUleb128Buffer(this.timeSuspendEnd);
        }
        return this.timeSuspendEnd;
    }
    setTimeSuspendEnd(value: number) {
        this.timeSuspendEnd = value;
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
            this.getState('buffer'),
            this.getUserId('buffer'),
            this.getLevel('buffer'),
            this.getTimeStart('buffer'),
            this.getTimeEnd('buffer'),
            this.getState() === STATE_USER_SUSPEND
                ? this.getTimeSuspendEnd('buffer')
                : EmptyBuffer,
            BufferWrapper.numberToUleb128Buffer(buffKey.length),
            buffKey
        ];
    }

    setDataFromBufferWrapper(
        buff: BufferWrapper
    ) {
        this.setState(buff.readUleb128() as UserState);
        this.setUserId(buff.readUleb128());
        this.setLevel(buff.readUleb128());
        this.setTimeStart(buff.readUleb128());
        this.setTimeEnd(buff.readUleb128());
        if (this.getState() === STATE_USER_SUSPEND) {
            this.setTimeSuspendEnd(buff.readUleb128());
        }
        this.setKey(buff.read(buff.readUleb128()));
    }

    //#endregion
}
export default {
    [TYPE_USER_USER]: UserUser
};