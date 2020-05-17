import BufferWrapper from "@/libs/BufferWrapper";

/******************************/

const EmptyBuffer = Buffer.alloc(0);

/******************************/

export abstract class TxnAny {
    protected abstract type: number;
    protected data = EmptyBuffer;

    /******************************/

    //#region set-get

    getType(): number;
    getType(format: 'buffer'): BufferWrapper;
    getType(format?: 'buffer') {
        if (format) return BufferWrapper.numberToUleb128Buffer(this.type);
        return this.type;
    }

    getData(): any;
    getData(format: 'buffer'): Buffer;
    getData(format?: 'buffer') {
        if (format) {
            return this.data;
        }
        throw new Error("Not implement");
    }
    setData(value: any) {
        if (value instanceof Buffer) {
            this.data = value;
        } else {
            throw new Error("Not implement");
        }
        return this;
    }

    // getBlockHash(): TxnBase['blockHash'];
    // getBlockHash(format: 'buffer'): Buffer;
    // getBlockHash(format?: 'buffer') {
    //     if (format) {
    //         return this.blockHash === null
    //             ? EmptyBuffer
    //             : Hash.create({type: 1}).setData(this.blockHash).toBuffer();
    //     }
    //     return this.blockHash;
    // }
    // setBlockHash(value: Buffer | null) {
    //     this.blockHash = value;
    //     return this;
    // }

    //#endregion
    //#region logical

    abstract verify(inputs?: {}): boolean | Promise<boolean>;
    abstract read(inputs?: {}): void;

    //#endregion
    //#region import-export buffer

    toBuffer(
        inBlock = false
    ) {
        return BufferWrapper.concat(this.getBufferStructure(inBlock));
    }
    abstract getBufferStructure(inBlock: boolean): Buffer[];
    abstract setDataFromBufferWrapper(data: BufferWrapper): void;

    //#endregion
}
export abstract class TxnTypeInternal extends TxnAny {}
export abstract class TxnTypeAdmin extends TxnAny {
    abstract getSigningBlockIndex(): number;
    abstract getSigningBlockIndex(format: 'buffer'): BufferWrapper;
    abstract setSigningBlockIndex(value: number): this;
    abstract getAuthorId(): number;
    abstract getAuthorId(format: 'buffer'): BufferWrapper;
    abstract setAuthorId(value: number): this;
    abstract getSignature(): Buffer;
    abstract setSignature(value: Buffer): this;
    abstract getHash(): Buffer;
}
export abstract class TxnTypeUser extends TxnAny {
    abstract getSigningBlockHash(): Buffer;
    abstract setSigningBlockHash(value: Buffer): this;
    abstract getAuthorId(): number;
    abstract getAuthorId(format: 'buffer'): BufferWrapper;
    abstract setAuthorId(value: number): this;
    abstract getSignature(): Buffer;
    abstract setSignature(value: Buffer): this;
    abstract getHash(): Buffer;
}
