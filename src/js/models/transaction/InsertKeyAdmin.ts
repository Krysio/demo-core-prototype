import { Context } from "@/context";
import * as secp256k1 from "@/services/crypto/ec/secp256k1";
import { TxnTypeAdmin } from "./Base";
import { User, UserAdmin, TYPE_USER_ADMIN, UserRoot } from "@/models/user";
import { TYPE_KEY_Secp256k1 } from "@/models/key";
import BufferWrapper from "@/libs/BufferWrapper";

/******************************/

export const TYPE_TXN_INSERT_KEY_ADMIN = 16;
export class TxnInsertKeyAdmin extends TxnTypeAdmin {
    protected type = TYPE_TXN_INSERT_KEY_ADMIN;

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

    //#endregion
    //#region logical

    async verifyPrepareInputs(context: Context) {
        const author = await context.getUserById(this.getAuthorId());
        return { author };
    }

    verify(inputs: {
        author: UserRoot | UserAdmin;
    }) {
        // poprawny autor - root lub administrator

        const author = inputs.author;

        if (!this.isValidAuthor(author)) {
            return false;
        }

        // TODO userId nie jest zajęty

        try {
            const user = this.getData();
            if (user.getType() !== TYPE_USER_ADMIN) {
                return false;
            }

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

                if (secp256k1.verify(buffKey, hash, signature) === false) {
                    return false;
                }
            }
            return user.verify();
        } catch (error) {
            return false;
        }
    }

    read(
        context: Context
    ) {
        const data = this.getData('buffer');
        const buff = BufferWrapper.create(data).seek(0);

        buff.readUleb128(); // type

        const userId = buff.readUleb128();

        if (data !== null) {
            context.storeUserWithId(userId, data);
        }
    }

    //#endregion
}
export default {
    [TYPE_TXN_INSERT_KEY_ADMIN]: TxnInsertKeyAdmin
}
