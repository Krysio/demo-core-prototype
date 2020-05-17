import chalk from "chalk";
import BufferWrapper from "@/libs/BufferWrapper";

/******************************/

export default class BaseKey {
    protected type = 0;
    protected data = null as Buffer | null;

    /******************************/

    constructor() { throw new Error('use Key.create({})'); }

    static create(data: {
        type?: number,
        data?: Buffer | null
    } = {}): BaseKey {
        data.type = data.type || 0;
        data.data = data.data || null;

        const Type = this.typeMap[data.type];
        if (Type) {
            Object.setPrototypeOf(data, Type.prototype);
        } else {
            Object.setPrototypeOf(data, BaseKey.prototype);
        }
        //@ts-ignore
        return data as BaseKey;
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
            BaseKey.create(this);
        }
    }
    getData() { return this.data; }
    setData(value: Buffer | null) { this.data = value; }

    verify() {
        return false;
    }

    /******************************/

    toBuffer() {
        const data = this.getData();

        let buffer = BufferWrapper.numberToUleb128Buffer(this.getType()) as Buffer;

        if (data !== null) {
            buffer = Buffer.concat([buffer, data]);
        }

        return buffer;
    }

    static fromBuffer(dataBuffer: Buffer) {
        const buffer = BufferWrapper.create(dataBuffer);
        const type = buffer.readUleb128();
        const data = buffer.slice(buffer.cursor);

        return this.create({
            type,
            data: data.length ? data : null
        });
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
