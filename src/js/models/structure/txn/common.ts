import { structure } from "../base";
import { Author } from "../Author";
import { BlockIndex } from "../BlockIndex";
import { BlockHash } from "../Hash";
import { Signature } from "../Signature";

/******************************/

export function standaloneByAdmin<S extends {[K in keyof S]: S[K]}>(schema: S) {
    return class TxnByAdmin extends structure({
        ...schema,
        'author': Author,
        'signingBlockIndex': BlockIndex,
        'signature': Signature
    }) {
        public isUserTransaction() {return false;}
        public isAdminTransaction() {return true;}
    };
}

export function standaloneByUser<S extends {[K in keyof S]: S[K]}>(schema: S) {
    return class TxnByUser extends structure({
        ...schema,
        'author': Author,
        'signingBlockHash': BlockHash,
        'signature': Signature
    }) {
        public isUserTransaction() {return true;}
        public isAdminTransaction() {return false;}
    };
}

export function internalByUser<S extends {[K in keyof S]: S[K]}>(schema: S) {
    return class TxnByUser extends structure({
        ...schema,
        'author': Author,
        'signature': Signature
    }) {
        public isUserTransaction() {return true;}
        public isAdminTransaction() {return false;}
    };
}
