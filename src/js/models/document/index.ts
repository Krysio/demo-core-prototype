import BufferWrapper from "@/libs/BufferWrapper";
import { Hash, TYPE_HASH_NULL } from "@/models/hash";

/******************************/

/*
Neg Type
0   00 - unsignet integer
0   01 - unsignet float
0   11 - unsignet logaritmic
1   00 - integer
1   01 - float
1   11 - logaritmic
*/
export const TYPE_CREDIT_DISTRIBUTION_UINT = 0;
export const TYPE_CREDIT_DISTRIBUTION_UFLOAT = 1;
export const TYPE_CREDIT_DISTRIBUTION_ULOG = 3;
export const TYPE_CREDIT_DISTRIBUTION_INT = 4;
export const TYPE_CREDIT_DISTRIBUTION_FLOAT = 5;
export const TYPE_CREDIT_DISTRIBUTION_LOG = 7;

export const FILE_FORMAT_TXT = 0;
export const FILE_FORMAT_MARKDOWN = 1;

type CreditDistribution =
    typeof TYPE_CREDIT_DISTRIBUTION_UINT |
    typeof TYPE_CREDIT_DISTRIBUTION_UFLOAT |
    typeof TYPE_CREDIT_DISTRIBUTION_ULOG |
    typeof TYPE_CREDIT_DISTRIBUTION_INT |
    typeof TYPE_CREDIT_DISTRIBUTION_FLOAT |
    typeof TYPE_CREDIT_DISTRIBUTION_LOG;

type FileType =
    typeof FILE_FORMAT_TXT |
    typeof FILE_FORMAT_MARKDOWN;

const EmptyBuffer = Buffer.alloc(0);

/******************************/

class Document {
    protected authorId = -1;
    protected timeEnd = -1;
    protected fileHash = EmptyBuffer;
    protected fileFormat: FileType = FILE_FORMAT_TXT;
    protected countOfOptions = -1;
    protected countOfCredits = -1;
    protected typeDistribution: CreditDistribution = TYPE_CREDIT_DISTRIBUTION_UINT;

    //#region constructor

    constructor() {}
    static create() {return new Document()}

    //#endregion
    //#region import-export buffer

    static fromBuffer(
        inputBuff: Buffer
    ) {
        const buff = BufferWrapper.create(inputBuff).seek(0);
        const instance = this.create();

        instance.setAuthorId(buff.readUleb128());
        instance.setTimeEnd(buff.readUleb128());
        instance.setFileHash(buff.read(buff.readUleb128()));
        instance.setFileFormat(buff.readUleb128() as FileType);
        instance.setCountOfOptions(buff.readUleb128());
        instance.setCountOfCredits(buff.readUleb128());
        instance.setTypeDistribution(buff.readUleb128() as CreditDistribution);

        return instance;
    }

    toBuffer() {
        const fileHash = this.getFileHash('buffer');

        return BufferWrapper.concat([
            this.getAuthorId('buffer'),
            this.getTimeEnd('buffer'),
            BufferWrapper.numberToUleb128Buffer(fileHash.length),
            fileHash,
            this.getFileFormat('buffer'),
            this.getCountOfOptions('buffer'),
            this.getCountOfCredits('buffer'),
            this.getTypeDistribution('buffer')
        ]);
    }

    //#endregion
    //#region set-get

    getFileHash(): Hash;
    getFileHash(format: 'buffer'): Buffer;
    getFileHash(format?: 'buffer') {
        if (format) {
            return this.fileHash;
        }
        return Hash.fromBuffer(this.fileHash);
    }
    setFileHash(
        value: Buffer | Hash
    ) {
        if (value instanceof Buffer) {
            this.fileHash = value;
        } else {
            this.fileHash = value.toBuffer();
        }
        return this;
    }

    getFileFormat(): FileType;
    getFileFormat(format: 'buffer'): BufferWrapper;
    getFileFormat(format?: 'buffer') {
        if (format) {
            return BufferWrapper.numberToUleb128Buffer(this.fileFormat);
        }
        return this.fileFormat;
    }
    setFileFormat(
        value: FileType
    ) {
        this.fileFormat = value;
        return this;
    }

    getTypeDistribution(): CreditDistribution;
    getTypeDistribution(format: 'buffer'): BufferWrapper;
    getTypeDistribution(format?: 'buffer') {
        if (format) {
            return BufferWrapper.numberToUleb128Buffer(this.typeDistribution);
        }
        return this.typeDistribution;
    }
    setTypeDistribution(
        value: CreditDistribution
    ) {
        this.typeDistribution = value;
        return this;
    }

    getAuthorId(): number;
    getAuthorId(format: 'buffer'): BufferWrapper;
    getAuthorId(format?: 'buffer') {
        if (format) {
            return BufferWrapper.numberToUleb128Buffer(this.authorId);
        }
        return this.authorId;
    }
    setAuthorId(value: number) {
        this.authorId = value;
        return this;
    }

    getTimeEnd(): number;
    getTimeEnd(format: 'buffer'): BufferWrapper;
    getTimeEnd(format?: 'buffer') {
        if (format === 'buffer') {
            return BufferWrapper.numberToUleb128Buffer(this.timeEnd);
        }
        return this.timeEnd;
    }
    setTimeEnd(value: number) {
        this.timeEnd = value;
        return this;
    }

    getCountOfOptions(): number;
    getCountOfOptions(format: 'buffer'): BufferWrapper;
    getCountOfOptions(format?: 'buffer') {
        if (format === 'buffer') {
            return BufferWrapper.numberToUleb128Buffer(this.countOfOptions);
        }
        return this.countOfOptions;
    }
    setCountOfOptions(value: number) {
        this.countOfOptions = value;
        return this;
    }

    getCountOfCredits(): number;
    getCountOfCredits(format: 'buffer'): BufferWrapper;
    getCountOfCredits(format?: 'buffer') {
        if (format === 'buffer') {
            return BufferWrapper.numberToUleb128Buffer(this.countOfCredits);
        }
        return this.countOfCredits;
    }
    setCountOfCredits(value: number) {
        this.countOfCredits = value;
        return this;
    }

    //#endregion
    //#region logical

    verify() {
        const fileHash = this.getFileHash();

        if (fileHash.getType() === TYPE_HASH_NULL
            || fileHash.verify() === false
        ) {
            return false;
        }

        if (this.getCountOfCredits() > 1
            || this.getCountOfOptions() > 1
        ) {
            return false;
        }

        return true;
    }

    //#endregion
}

/******************************/

export { Document }
