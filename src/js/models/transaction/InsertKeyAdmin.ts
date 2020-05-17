import { Context } from "@/context";
import BufferWrapper from "@/libs/BufferWrapper";
import * as secp256k1 from "@/services/crypto/ec/secp256k1";
import { TxnTypeAdmin } from "./Base";
import { User, UserAdmin, TYPE_USER_ADMIN, UserRoot } from "@/models/user";
import { HashSum } from "@/services/crypto/sha256";
import { TYPE_KEY_Secp256k1 } from "../key";

/******************************/

const EMPTY = {};
const EmptyBuffer = Buffer.alloc(0);

/******************************/

export const TYPE_TXN_INSERT_KEY_ADMIN = 16;
export class TxnInsertKeyAdmin extends TxnTypeAdmin {
    protected type = TYPE_TXN_INSERT_KEY_ADMIN;
    protected blockIndex = 0;
    protected authorId = 0;
    protected signature = EmptyBuffer;

    //#region set-get

    getData(): UserAdmin;
    getData(format: 'buffer'): Buffer;
    getData(format?: 'buffer') {
        if (format) {
            return this.data;
        }
        return User.fromBuffer(this.data);
    }
    setData(value: UserAdmin | Buffer) {
        if (value instanceof Buffer) {
            this.data = value;
        } else {
            this.data = value.toBuffer();
        }
        return this;
    }

    getSigningBlockIndex(): number;
    getSigningBlockIndex(format: 'buffer'): BufferWrapper;
    getSigningBlockIndex(format?: 'buffer') {
        if (format) {
            return BufferWrapper.numberToUleb128Buffer(this.blockIndex);
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

    getHash() {
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
    //#region logical

    verify(inputs: {
        author: UserRoot | UserAdmin;
    }) {
        try {
            const user = this.getData();
            if (user.getType() !== TYPE_USER_ADMIN) {
                return false;
            }

            const author = inputs.author;
            if (!(author instanceof UserRoot)
                && !(author instanceof UserAdmin)
            ) {
                return false;
            }
            if (author.getLevel() + 1 !== user.getLevel()) {
                return false;
            }

            const key = author.getKey();
            if (key.getType() === TYPE_KEY_Secp256k1) {
                const buffKey = key.getData();
                const hash = this.getHash();
                const signature = this.getSignature();

                console.log(
                    buffKey.toString('hex'),
                    hash.toString('hex'),
                    signature.toString('hex')
                );

                if (secp256k1.verify(buffKey, hash, signature) === false) {
                    return false;
                }
            }
            return user.verify();
        } catch (error) {
            return false;
        }
    }

    read(inputs: {
        context: Context
    }) {
        const data = this.getData('buffer');

        if (data !== null) {
            inputs.context.store.keys.put(0, data);
        }
    }

    //#endregion
    //#region import-export buffer

    getBufferStructure() {
        const buffData = this.getData('buffer');
        const signature = this.getSignature();

        return [
            this.getType('buffer'),
            BufferWrapper.numberToUleb128Buffer(buffData.length),
            buffData,
            this.getSigningBlockIndex('buffer'),
            this.getAuthorId('buffer'),
            BufferWrapper.numberToUleb128Buffer(signature.length),
            signature
        ];
    }

    setDataFromBufferWrapper(
        buff: BufferWrapper
    ) {
        this.setData(buff.read(buff.readUleb128()));
        this.setSigningBlockIndex(buff.readUleb128());
        this.setAuthorId(buff.readUleb128());
        this.setSignature(buff.read(buff.readUleb128()));
    }

    //#endregion
}
export default {
    [TYPE_TXN_INSERT_KEY_ADMIN]: TxnInsertKeyAdmin
}
