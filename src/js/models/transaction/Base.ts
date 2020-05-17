import chalk from "chalk";
import BufferWrapper from "@/libs/BufferWrapper";
import { Hash } from "../hash";

/******************************/

const EmptyBuffer = Buffer.alloc(0);

/******************************/

export default class TxnBase {
    protected type = 0;
    protected data = EmptyBuffer;
    protected blockHash = null as Buffer | null;
    protected authors = null as number[] | null;
    protected signatures = null as Buffer[] | null;

    /******************************/

    //#region constructor

    constructor() { throw new Error('use Transaction.create({})'); }

    static create(data: {
        type?: number,
        data?: Buffer | null,
        blockHash?: Buffer | null,
        authors?: number[] | null,
        signatures?: Buffer[] | null
    } = {}): TxnBase {
        data.type = data.type || 0;
        data.blockHash = data.blockHash || null;
        data.data = data.data || null;
        data.authors = data.authors || null;
        data.signatures = data.signatures || null;

        const Type = this.typeMap[data.type];
        if (Type) {
            Object.setPrototypeOf(data, Type.prototype);
        } else {
            throw new Error(`Unknown Txn type ${ data.type }`);
        }
        //@ts-ignore
        return data as TxnBase;
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
        if (format) return BufferWrapper.numberToUleb128Buffer(this.type);
        return this.type;
    }
    setType(value: number) {
        if (this.type !== value) {
            this.type = value;
            //@ts-ignore
            TxnBase.create(this);
        }
        return this;
    }

    getData(): any;
    getData(format: 'buffer'): BufferWrapper;
    getData(format?: 'buffer') {
        if (format) return this.data || Buffer.alloc(0);
        return this.data;
    }
    setData(value: Buffer | null) {
        this.data = value;
        return this;
    }

    getBlockHash(): TxnBase['blockHash'];
    getBlockHash(format: 'buffer'): Buffer;
    getBlockHash(format?: 'buffer') {
        if (format) {
            return this.blockHash === null
                ? EmptyBuffer
                : Hash.create({type: 1}).setData(this.blockHash).toBuffer();
        }
        return this.blockHash;
    }
    setBlockHash(value: Buffer | null) {
        this.blockHash = value;
        return this;
    }

    //#endregion

    verify(inputs: {}): boolean | Promise<boolean> {return false;}
    read(inputs: {}): void {}

    //#region import-export buffer

    toBuffer() {
        return BufferWrapper.concat([
            this.getType('buffer'),
            this.getDataBuffer()
        ]);
    }

    getDataBuffer(): Buffer {throw new Error();}
    setDataFromBufferWrapper(data: BufferWrapper) {
        throw new Error();
    }

    static fromBuffer(dataBuffer: Buffer) {
        const buffer = BufferWrapper.create(dataBuffer).seek(0);
        const type = buffer.readUleb128();
        const instance = this.create({ type });
        instance.setDataFromBufferWrapper(buffer);
        return instance;
    }

    //#endregion
    //#region node-inspect

    [Symbol.for('nodejs.util.inspect.custom')]() {
        const data = this.getData();
        const dataStr = data ? data.toString('hex') : 'null';

        return `${
                chalk.green(Object.getPrototypeOf(this).constructor.name)
            }${
                chalk.blueBright(
                    BufferWrapper.numberToUleb128Buffer(
                        this.getType()
                    ).toString('hex')
                )
            }${
                chalk.yellow(
                    this.getBlockHash('buffer').toString('hex')
                )
            }${
                chalk.redBright(dataStr)
            }`;
    }

    //#endregion
}
