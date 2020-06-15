import BufferWrapper from "@/libs/BufferWrapper";
import { HashSum } from "@/services/crypto/sha256";
import { Block } from "../block";
import { Context } from "@/context";
import { TYPE_USER_ROOT, TYPE_USER_ADMIN, UserAny } from "../user";

/******************************/

const EmptyBuffer = Buffer.alloc(0);
const EmptyInputs = new Promise((r) => r({}));

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

    //#endregion
    //#region logical

    verifyPrepareInputs(
        context: Context,
        block?: Block
    ) {return EmptyInputs;}
    abstract verify(inputs?: {}): boolean | Promise<boolean>;
    abstract read(context: Context): void;

    //#endregion
    //#region import-export buffer

    toBuffer(
        standalone = false
    ) {
        return BufferWrapper.concat(this.getBufferStructure(standalone));
    }
    abstract getBufferStructure(standalone: boolean): Buffer[];
    abstract setDataFromBufferWrapper(data: BufferWrapper): void;

    //#endregion
}
export abstract class TxnTypeInternal extends TxnAny {}
export abstract class TxnTypeAdmin extends TxnAny {
    protected blockIndex = -1;
    protected authorId = -1;
    protected signature = EmptyBuffer;

    isValidAuthor(
        author: UserAny | null
    ) {
        if (author === null) {
            return false;
        }

        const type = author.getType();

        if (type !== TYPE_USER_ROOT
            && type !== TYPE_USER_ADMIN
        ) {
            return false;
        }

        return true;
    }

    //#region set-get

    getSigningBlockIndex(): number;
    getSigningBlockIndex(format: 'buffer'): BufferWrapper;
    getSigningBlockIndex(format?: 'buffer') {
        if (format) {
            return this.blockIndex === -1
                ? EmptyBuffer
                : BufferWrapper.numberToUleb128Buffer(this.blockIndex);
        }
        return this.blockIndex;
    }
    setSigningBlockIndex(value: number) {
        this.blockIndex = value;
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

    getSignature() {
        return this.signature;
    }
    setSignature(value: Buffer) {
        this.signature = value;
        return this;
    }

    getHash(signingBlockIndex?: number) {
        if (this.getSigningBlockIndex() < 0) {
            if (!signingBlockIndex) {
                throw new Error();
            }
            this.setSigningBlockIndex(signingBlockIndex);
        }

        const hash = new HashSum();
        const elementList = this.getBufferStructure();

        elementList.pop(); // pop signature
        elementList.pop(); // pop signature size

        for (let item of elementList) {
            hash.push(item);
        }

        return hash.get('buffer');
    }

    //#endregion
    //#region import-export buffer

    getBufferStructure(
        standalone = false
    ) {
        const buffData = this.getData('buffer');
        const signature = this.getSignature();

        return [
            this.getType('buffer'),
            BufferWrapper.numberToUleb128Buffer(buffData.length),
            buffData,
            standalone
                ? this.getSigningBlockIndex('buffer')
                : EmptyBuffer,
            this.getAuthorId('buffer'),
            BufferWrapper.numberToUleb128Buffer(signature.length),
            signature
        ];
    }

    setDataFromBufferWrapper(
        buff: BufferWrapper,
        standalone = false
    ) {
        this.setData(buff.read(buff.readUleb128()));
        if (standalone) {
            this.setSigningBlockIndex(buff.readUleb128());
        }
        this.setAuthorId(buff.readUleb128());
        this.setSignature(buff.read(buff.readUleb128()));
    }

    //#endregion
}
export abstract class TxnTypeUser extends TxnAny {
    protected authorId = -1;
    protected signature = EmptyBuffer;
    protected signingBlockHash = EmptyBuffer;

    getSigningBlockHash(): Buffer {
        return this.signingBlockHash;
    }
    setSigningBlockHash(value: Buffer) {
        this.signingBlockHash = value;
        return this;
    }

    isValidAuthor(
        author: UserAny | null
    ) {
        if (author === null) {
            return false;
        }

        const type = author.getType();

        if (type !== TYPE_USER_ROOT
            && type !== TYPE_USER_ADMIN
        ) {
            return false;
        }

        return true;
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

    getSignature() {
        return this.signature;
    }
    setSignature(value: Buffer) {
        this.signature = value;
        return this;
    }

    getHash(signingBlockHash?: Buffer) {
        if (this.getSigningBlockHash().length > 0) {
            if (!signingBlockHash) {
                throw new Error();
            }
            this.setSigningBlockHash(signingBlockHash);
        }

        const hash = new HashSum();
        const elementList = this.getBufferStructure();

        elementList.pop(); // pop signature
        elementList.pop(); // pop signature size

        for (let item of elementList) {
            hash.push(item);
        }

        return hash.get('buffer');
    }

    //#region import-export buffer

    getBufferStructure(
        standalone = false
    ) {
        const buffData = this.getData('buffer');
        const signature = this.getSignature();

        return [
            this.getType('buffer'),
            BufferWrapper.numberToUleb128Buffer(buffData.length),
            buffData,
            standalone
                ? this.getSigningBlockHash()
                : EmptyBuffer,
            this.getAuthorId('buffer'),
            BufferWrapper.numberToUleb128Buffer(signature.length),
            signature
        ];
    }

    setDataFromBufferWrapper(
        buff: BufferWrapper,
        standalone = false
    ) {
        this.setData(buff.read(buff.readUleb128()));
        if (standalone) {
            this.setSigningBlockHash(buff.read(32 ));
        }
        this.setAuthorId(buff.readUleb128());
        this.setSignature(buff.read(buff.readUleb128()));
    }

    //#endregion
}
