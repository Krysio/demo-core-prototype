import chalk from "chalk";
import { HashSum } from "@/services/crypto/sha256";
import BufferWrapper from "@/libs/BufferWrapper";
import { Transaction } from "../transaction";

/******************************/

const EmptyBuffer = Buffer.alloc(0);

/******************************/

export class Block {
    protected hash = EmptyBuffer;
    protected index = 0;
    protected time = 0;
    protected type = 0;
    protected previousHash = null as Buffer | null;
    protected body = [] as Buffer[];

    /******************************/

    //#region constructor

    constructor() { throw new Error('use Block.create({})'); }

    static create(data: {
        index?: number,
        time?: number,
        previousHash?: Buffer | null
        body?: Buffer[]
    } = {}): Block {
        data.index = data.index || 0;
        data.time = data.time || 0;
        data.previousHash = data.previousHash || null;
        data.body = data.body || [];

        Object.setPrototypeOf(data, Block.prototype);
        Block.prototype.calcHash.call(data);

        //@ts-ignore
        return data as Block;
    }

    //#endregion
    //#region set-get

    protected calcHash() {
        const hash = new HashSum();

        let indexHex = this.index.toString(16);
        let timeHex = this.time.toString(16);

        if (indexHex.length % 2) {
            indexHex = '0'+indexHex;
        }
        if (timeHex.length % 2) {
            timeHex = '0'+timeHex;
        }

        hash.push(Buffer.from(indexHex, 'hex'));
        hash.push(Buffer.from(timeHex, 'hex'));

        if (this.previousHash !== null) {
            hash.push(this.previousHash);
        }
        for (let item of this.body) {
            hash.push(item);
        }

        this.hash = hash.get();
    }

    getHash() {
        return this.hash;
    }

    getBody(): Buffer[];
    getBody(type: 'buffer'): BufferWrapper;
    getBody(type?: 'buffer') {
        if (type) return BufferWrapper.arrayOfBufferToUleb128Buffer(this.body);
        return this.body.slice();
    }

    getIndex(): number;
    getIndex(type: 'buffer'): BufferWrapper;
    getIndex(type?: 'buffer') {
        if (type) return BufferWrapper.numberToUleb128Buffer(this.index);
        return this.index;
    }
    setIndex(value: number) {
        this.index = value;
        this.calcHash();
    }

    getTime(): number;
    getTime(type: 'buffer'): BufferWrapper;
    getTime(type?: 'buffer') {
        if (type) return BufferWrapper.numberToUleb128Buffer(this.time);
        return this.time;
    }
    setTime(value: number) {
        this.time = value;
        this.calcHash();
    }

    getPreviousBlockHash(type?: 'buffer') {
        if (type) return this.previousHash === null
            ? Buffer.alloc(0)
            : this.previousHash;
        return this.previousHash;
    }
    setPreviousBlockHash(value: Buffer) {
        this.previousHash = value;
        this.calcHash();
    }

    insertTransaction(
        txn: Buffer
    ) {
        this.body.push(txn);
        this.body.sort(Buffer.compare);
        this.calcHash();
    }

    getTransactionListByType(
        type: number
    ) {
        const result = [] as Transaction[];
        const typeUleb = BufferWrapper.numberToUleb128Buffer(type);

        for (let txnBuffer of this.getBody()) {
            let flag = true;

            for (let i = 0; i < typeUleb.length; i++) {
                if (txnBuffer[ i ] !== typeUleb[ i ]) {
                    flag = false;
                    break;
                }
            }

            if (flag) {
                result.push(Transaction.fromBuffer(txnBuffer));
            }
        }

        return result;
    }

    //#endregion

    verify() {
        const txnDataList = this.getBody();

        for (let data of txnDataList) {
            const txt = Transaction.fromBuffer(data);

            if (txt.verify({ block: this }) === false) {
                return false;
            }
        }

        return true;
    }

    //#region import-export buffer

    toBuffer() {
        const prevHash = this.getPreviousBlockHash();

        return Buffer.concat([
            this.getIndex('buffer'),
            this.getTime('buffer'),
            this.getPreviousBlockHash('buffer'),
            this.getBody('buffer')
        ]);
    }
    static fromBuffer(
        dataBuffer: Buffer
    ) {
        const buffer = BufferWrapper.create(dataBuffer).seek(0);
        const index = buffer.readUleb128();

        const result = this.create({
            index,
            time: buffer.readUleb128(),
            previousHash: index ? buffer.read(32) : null,
            body: buffer.readUleb128ArrayOfBuffer()
        });

        return result;
    }

    //#endregion
    //#region nodejs-inspect
    [Symbol.for('nodejs.util.inspect.custom')]() {return this.inspect();}
    inspect() {
        const prevHash = this.getPreviousBlockHash();
        const prevHashStr = prevHash ? prevHash.toString('hex') : 'null';

        return [
            `${
                chalk.green(Object.getPrototypeOf(this).constructor.name)
            } ${
                chalk.blueBright(this.getIndex().toString())
            }`,
            `\t${
                chalk.greenBright('selfHash')
            }:${
                chalk.redBright(this.getHash().toString('hex'))
            }`,
            `\t${
                chalk.green('prevHash')
            }:${
                chalk.red(prevHashStr)
            }`,
            `\t${
                chalk.greenBright('time')
            }: ${
                chalk.blueBright(this.getTime().toString(16))
            } ${
                chalk.greenBright('txns')
            }: ${
                chalk.blueBright(this.body.length.toString())
            }`,
            ...this.getBody().map((item, index) => {
                return `\t\t${ chalk[ index % 2 ? 'blueBright' : 'blue' ](item.toString('hex')) }`;
            }),

            chalk.yellow(this.toBuffer().toString('hex'))
        ].join("\n");
    }

    //#endregion
}