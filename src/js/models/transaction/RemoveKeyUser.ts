import { Context } from "@/context";
import * as secp256k1 from "@/services/crypto/ec/secp256k1";
import { TxnTypeAdmin } from "./Base";
import { User, UserAny, UserRoot, UserAdmin, TYPE_USER_PUBLIC, TYPE_USER_ROOT, UserUser, UserPublic } from "@/models/user";
import { TYPE_KEY_Secp256k1 } from "@/models/key";
import BufferWrapper from "@/libs/BufferWrapper";

/******************************/

export const TYPE_TXN_REMOVE_KEY_USER = 19;
export class TxnRemoveKey extends TxnTypeAdmin {
    protected type = TYPE_TXN_REMOVE_KEY_USER;

    //#region set-get

    getData(): number;
    getData(format: 'buffer'): Buffer;
    getData(format?: 'buffer') {
        if (format) {
            return this.data;
        }
        return BufferWrapper.create(this.data).seek(0).readUleb128();
    }
    setData(value: number | Buffer) {
        if (value instanceof Buffer) {
            this.data = value;
        } else {
            this.data = BufferWrapper.numberToUleb128Buffer(value);
        }
        return this;
    }

    //#endregion
    //#region logical

    async verifyPrepareInputs(context: Context) {
        const userId = this.getData();
        const user = await context.getUserById(userId);
        const author = await context.getUserById(this.getAuthorId());

        return { user, author };
    }

    verify(inputs: {
        author: UserRoot | UserAdmin;
        user: UserAdmin | UserUser | UserPublic;
    }) {
        const { author, user } = inputs;

        // Poprawny autor - root lub administrator
        if (!this.isValidAuthor(author)) {
            return false;
        }

        // User istnieje
        if (user === null) {
            return false;
        }

        // Nie da się kasować root'a
        if (user.getType() === TYPE_USER_ROOT) {
            return false;
        }

        // Kasować może tylko root lub admin
        if (!(author instanceof UserRoot)
            && !(author instanceof UserAdmin)
        ) {
            return false;
        }

        // Admina można usunąć tylko gdy jego level jest podrzędny
        if (user instanceof UserAdmin) {
            if (user.getLevel() <= author.getLevel()) {
                return false;
            }
        }

        try {
            // Podpis
            const key = author.getKey();
            if (key.getType() === TYPE_KEY_Secp256k1) {
                const buffKey = key.getData();
                const hash = this.getHash();
                const signature = this.getSignature();

                if (secp256k1.verify(buffKey, hash, signature) === false) {
                    return false;
                }
            }
        } catch (error) {
            return false;
        }

        return true;
    }

    async read(
        context: Context
    ) {
        const userId = this.getData();
        await context.removeUserById(userId);
    }

    //#endregion
}
export default {
    [TYPE_TXN_REMOVE_KEY_USER]: TxnRemoveKey
}
