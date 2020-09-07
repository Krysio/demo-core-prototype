import { structure } from "../base";
import { Author } from "../Author";
import { BlockIndex } from "../BlockIndex";
import { BlockHash } from "../Hash";
import { Signature } from "../Signature";
import { User, TYPE_USER_ADMIN, TYPE_USER_USER } from "../User";
import { Context } from "@/context";

/******************************/

export function standaloneByAdmin<S extends {[K in keyof S]: S[K]}>(schema: S) {
    return class TxnByAdmin extends structure({
        ...schema,
        'signingBlockIndex': BlockIndex,
        'author': Author,
        'signature': Signature
    }) {
        isUserTransaction() {return false;}
        isAdminTransaction() {return true;}
        verify(inputs: {
            author: User;
        }) {
            if (inputs.author === null) {
                return false;
            }

            const author = inputs.author.asType(TYPE_USER_ADMIN);

            if (!author.isAdminLike()) {
                return false;
            }
            return true;
        }
        async verifyPrepareInputs(context: Context) {
            const author = await context.getUserById(this.getValue('author'));
            return { author };
        }
    };
}

export function standaloneByUser<S extends {[K in keyof S]: S[K]}>(schema: S) {
    return class TxnByAdmin extends structure({
        ...schema,
        'signingBlockHash': BlockHash,
        'author': Author,
        'signature': Signature
    }) {
        isUserTransaction() {return true;}
        isAdminTransaction() {return false;}
        async verifyPrepareInputs(context: Context) {
            const author = await context.getUserById(this.getValue('author'));
            return { author };
        }
        verify(inputs: {
            author: User;
        }) {
            if (inputs.author === null) return false;

            const author = inputs.author.asType(TYPE_USER_USER);

            if (!author.isUser()) {
                return false;
            }
            return true;
        }
    };
}

export function internalByUser<S extends {[K in keyof S]: S[K]}>(schema: S) {
    return class TxnByUser extends structure({
        ...schema,
        'author': Author,
        'signature': Signature
    }) {
        isUserTransaction() {return true;}
        isAdminTransaction() {return false;}
        async verifyPrepareInputs(context: Context) {
            const author = await context.getUserById(this.getValue('author'));
            return { author };
        }
    };
}
