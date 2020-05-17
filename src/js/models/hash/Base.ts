import chalk from "chalk";
import BufferWrapper from "@/libs/BufferWrapper";

/******************************/

export default class HashBase {
    protected type = 0;
    protected data = null as Buffer | null;

    /******************************/

    constructor() { throw new Error('use Hash.create({})'); }

    static create(data: {
        type?: number,
        data?: Buffer | null
    } = {}): HashBase {
        data.type = data.type || 0;
        data.data = data.data || null;

        const Type = this.typeMap[data.type];
        if (Type) {
            Object.setPrototypeOf(data, Type.prototype);
        } else {
            Object.setPrototypeOf(data, HashBase.prototype);
        }
        //@ts-ignore
        return data as HashBase;
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

    /******************************/

    getType() { return this.type; }
    setType(value: number) {
        if (this.type !== value) {
            this.type = value;
            //@ts-ignore
            HashBase.create(this);
        }
        return this;
    }
    getData() { return this.data; }
    setData(value: Buffer | null) {
        this.data = value;
        return this;
    }

    verify() {
        return false;
    }

    /******************************/

    toBuffer() {
        const data = this.getData();
        let bufferData = data;

        if (data === null) {
            bufferData = Buffer.alloc(0);
        }

        return BufferWrapper.concat([
            BufferWrapper.numberToUleb128Buffer(this.getType()),
            bufferData as Buffer
        ]);
    }
    setDataFromBufferWrapper(
        bufferWrapper: BufferWrapper
    ) {
        throw new Error(`Virtual ${this.getType()}`);
    }

    static fromBuffer(dataBuffer: Buffer) {
        const buffer = BufferWrapper.create(dataBuffer);
        const type = buffer.readUleb128();
        const instance = this.create({ type });
        instance.setDataFromBufferWrapper(buffer);
        return instance;
    }

    /******************************/

    [Symbol.for('nodejs.util.inspect.custom')]() {
        const data = this.getData();
        const dataStr = data ? data.toString('hex') : 'null';

        return `${
                chalk.green(Object.getPrototypeOf(this).constructor.name)
            }${
                chalk.blueBright(this.getType().toString())
            }${
                chalk.redBright(dataStr)
            }`;
    }
}
