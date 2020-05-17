import chalk from "chalk";
import BufferWrapper from "@/libs/BufferWrapper";
import { Key } from "@/models/key";

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

export default class UserBase {
    protected type = 0;
    protected key = null as Buffer;

    /******************************/

    //#region constructor

    constructor() { throw new Error('use Key.create({})'); }

    static create(data: {
        type?: number,
        key?: Buffer
    } = {}): UserBase {
        data.type = data.type || 0;
        data.key = data.key || EmptyBuffer;

        const Type = this.typeMap[data.type];
        if (Type) {
            Object.setPrototypeOf(data, Type.prototype);
        } else {
            Object.setPrototypeOf(data, UserBase.prototype);
        }
        //@ts-ignore
        return data as UserBase;
    }

    protected static typeMap = {} as { [key: number]: Function };
    static defineType(
        type: number,
        transactionClass: Function
    ) {
        if (this.typeMap[type]) {
            throw new Error("Type index is reserved");
        }
        this.typeMap[type] = transactionClass;
        return transactionClass;
    }

    //#endregion
    //#region set-get

    getType(): number;
    getType(format: 'buffer'): BufferWrapper;
    getType(format?: 'buffer') {
        if (format === 'buffer') {
            return BufferWrapper.numberToUleb128Buffer(this.type);
        }
        return this.type;
    }
    setType(value: number) {
        if (this.type !== value) {
            this.type = value;
            //@ts-ignore
            UserBase.create(this);
        }
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
    }

    //#endregion

    verify() {
        return false;
    }

    //#region import-export buffer

    toBuffer() {
        return BufferWrapper.concat([
            this.getType('buffer'),
            this.getDataBuffer()
        ]);
    }
    getDataBuffer(): Buffer {throw new Error();}
    setDataFromBufferWrapper(data: BufferWrapper) {throw new Error();}

    static fromBuffer(dataBuffer: Buffer) {
        const buffer = BufferWrapper.create(dataBuffer);
        const type = buffer.readUleb128();
        const instance = this.create({ type });
        instance.setDataFromBufferWrapper(buffer);
        return instance;
    }

    //#endregion
}
