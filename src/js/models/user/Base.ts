import BufferWrapper from "@/libs/BufferWrapper";
import { Key } from "@/models/key";

/******************************/

const EmptyBuffer = Buffer.alloc(0);

/******************************/

export default class UserBase {
    protected type = 0;
    protected key = EmptyBuffer;

    /******************************/

    //#region set-get

    getType(): number;
    getType(format: 'buffer'): BufferWrapper;
    getType(format?: 'buffer') {
        if (format === 'buffer') {
            return BufferWrapper.numberToUleb128Buffer(this.type);
        }
        return this.type;
    }

    getKey(): Key;
    getKey(format: 'buffer'): Buffer;
    getKey(format?: 'buffer') {
        if (format === 'buffer') {
            return this.key;
        }
        return Key.fromBuffer(this.key)
    }
    setKey(key: Buffer | Key) {
        if (key instanceof Buffer) {
            this.key = key;
        } else {
            this.key = key.toBuffer();
        }
        return this;
    }

    //#endregion
    //#region logical

    verify() {
        throw new Error("Not implement");
    }

    //#endregion
    //#region import-export buffer

    toBuffer(
        inBlock = false
    ) {
        return BufferWrapper.concat(this.getBufferStructure(inBlock));
    }
    getBufferStructure(
        inBlock = false
    ): Buffer[] {
        throw new Error("Not implement");
    }
    setDataFromBufferWrapper(data: BufferWrapper) {
        throw new Error("Not implement");
    }

    //#endregion
}
