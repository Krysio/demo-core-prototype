import { structure } from "../base";
import { Author } from "../Author";
import { BlockIndex } from "../BlockIndex";
import { BlockHash } from "../Hash";
import { Signature } from "../Signature";
import { User } from "../User";
import { Context } from "@/context";
import { Blob } from "../Blob";

/******************************/

export function standaloneByAdmin<S extends {[K in keyof S]: S[K]}>(schema: S) {
    return class TxnByAdmin extends structure({
        'author': Author,
        ...schema,
        'signingBlockIndex': BlockIndex,
        'signature': Signature
    }) {
        protected verifyInputs = {
            author: null as User
        };
        public isUserTransaction() {return false;}
        public isAdminTransaction() {return true;}
        public async verifyPrepareInputs(context: Context) {
            //@ts-ignore
            this.verifyInputs = this.verifyInputs || {};

            this.verifyInputs.author = await context.getUserById(
                this.getValue('author')
            );

            return this.verifyInputs;
        }
        public verify(inputs: {}) {
            const { author } = this.verifyInputs;

            // user istnieje w systemie
            if (author === null) return false;
            // user jest adminem
            if (!author.isAdminLike()) return false;
            // podpis
            if (!author.get('key').verify(
                //@ts-ignore
                this.getHash(),
                this.getValue('signature', Blob)
            )) return false;
            return true;
        }
    };
}

export function standaloneByUser<S extends {[K in keyof S]: S[K]}>(schema: S) {
    return class TxnByUser extends structure({
        'author': Author,
        ...schema,
        'signingBlockHash': BlockHash,
        'signature': Signature
    }) {
        protected verifyInputs = {
            author: null as User
        };
        public isUserTransaction() {return true;}
        public isAdminTransaction() {return false;}
        public async verifyPrepareInputs(context: Context) {
            //@ts-ignore
            this.verifyInputs = this.verifyInputs || {};

            this.verifyInputs.author = await context.getUserById(
                this.getValue('author')
            );

            return this.verifyInputs;
        }
        public verify(inputs: {}) {
            const { author } = this.verifyInputs;

            // user istnieje w systemie
            if (author === null) return false;
            // user jest userem
            if (!author.isUserLike()) return false;
            // podpis
            if (!author.get('key').verify(
                //@ts-ignore
                this.getHash(),
                this.getValue('signature', Blob)
            )) return false;
            return true;
        }
    };
}

export function internalByUser<S extends {[K in keyof S]: S[K]}>(schema: S) {
    return class TxnByUser extends structure({
        'author': Author,
        ...schema,
        'signature': Signature
    }) {
        protected verifyInputs = {
            author: null as User
        };
        public isUserTransaction() {return true;}
        public isAdminTransaction() {return false;}
        public async verifyPrepareInputs(context: Context) {
            //@ts-ignore
            this.verifyInputs = this.verifyInputs || {};

            this.verifyInputs.author = await context.getUserById(
                this.getValue('author')
            );

            return this.verifyInputs;
        }
        public verify(inputs: {}) {
            const { author } = this.verifyInputs;

            // user istnieje w systemie
            if (author === null) return false;
            // user jest userem
            if (!author.isUserLike()) return false;
            // podpis
            if (!author.get('key').verify(
                //@ts-ignore
                this.getHash(),
                this.getValue('signature', Blob)
            )) return false;
            return true;
        }
    };
}
