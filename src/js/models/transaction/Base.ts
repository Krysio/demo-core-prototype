import BufferWrapper from "@/libs/BufferWrapper";

/******************************/

const EmptyBuffer = Buffer.alloc(0);

/******************************/

export default class TxnBase {
    protected type = 0;
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

    verify(inputs: {}): boolean | Promise<boolean> {
        throw new Error("Not implement");
    }
    read(inputs: {}): void {
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
