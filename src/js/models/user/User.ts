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
Base.defineType(TYPE_USER_USER, class UserUser extends Base {
    protected state = STATE_USER_INACTIVE;
    protected timeStart = 0;
    protected timeEnd = 0;

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
});
