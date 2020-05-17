import { Context } from "@/context";
import BufferWrapper from "@/libs/BufferWrapper";
import Base from "./Base";
import { Block } from "@/models/block";
import { User, UserRoot, TYPE_USER_ROOT } from "@/models/user";

/******************************/

const EMPTY = {};
export const TYPE_TXN_INSERT_KEY_ROOT = 1;
export class TxnInsertKeyRoot extends Base {
    protected type = TYPE_TXN_INSERT_KEY_ROOT;

    //#region set-get

    getData(): UserRoot;
    getData(format: 'buffer'): Buffer;
    getData(format?: 'buffer') {
        if (format) {
            return this.data;
        }
        return User.fromBuffer(this.data);
    }
    setData(value: UserRoot | Buffer) {
        if (value instanceof Buffer) {
            this.data = value;
        } else {
            this.data = value.toBuffer();
        }
        return this;
    }

    //#endregion
    //#region logical

    verify(inputs: {
        block?: Block
    } = EMPTY) {
        if (inputs.block
            && inputs.block.getIndex() !== 0
        ) {
            return false;
        }

        try {
            const user = this.getData();
            if (user.getType() !== TYPE_USER_ROOT) {
                return false;
            }
            return user.verify();
        } catch (error) {
            return false;
        }
    }

    read(inputs: {
        context: Context
    }) {
        const data = this.getData('buffer');

        if (data !== null) {
            inputs.context.store.keys.put(0, data);
        }
    }

    //#endregion
    //#region import-export buffer

    getBufferStructure() {
        const buffData = this.getData('buffer');

        return [
            this.getType('buffer'),
            BufferWrapper.numberToUleb128Buffer(buffData.length),
            buffData
        ];
    }

    setDataFromBufferWrapper(
        bufferWrapper: BufferWrapper
    ) {
        this.setData(bufferWrapper.read(bufferWrapper.readUleb128()));
    }

    //#endregion
}
export default {
    [TYPE_TXN_INSERT_KEY_ROOT]: TxnInsertKeyRoot
}
