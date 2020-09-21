import { structure, typedStructure } from "./base";
import { Uleb128, ArrayOfUleb128 } from "./Uleb128";
import { BlockHash } from "./Hash";
import { Author } from "./Author";
import { Signature } from "./Signature";
import { BlockIndex } from "./BlockIndex";
import { Block } from "../Block";

import { Context } from "@/context";
import { HashSum } from "@/services/crypto/sha256";
import BufferWrapper from "@/libs/BufferWrapper";

import {
    standaloneByUser, internalByUser,
    internalInitial,
    internalCreateUser, standaloneCreateUser,
    internalRemoveUser, standaloneRemoveUser,
    internalEndoring, standaloneEndorsing,
    internalDocument, standaloneDocument,
    internalBind, standaloneBind,
    internalVote, standaloneVote
} from "./txn";

/******************************/

export const TYPE_TXN_VOTE = 64;
export const TYPE_TXN_BIND = 65;

/******************************/

//#region Internal

export class TxnInternal extends typedStructure({
        'type': {
            ...internalInitial,
            ...internalCreateUser,
            ...internalRemoveUser,
            ...internalEndoring,
            ...internalDocument,
            ...internalBind,
            ...internalVote,
        }
    }
) {
    apply(context: Context) {throw new Error();}
    getHash(
        selfBlock: Block,
        signingBlock: Block
    ) {
        const hash = new HashSum();

        hash.push(selfBlock.get('version').toBuffer());
        hash.push(this.get('type').toBuffer());
        hash.push(this.get('data').toBuffer());

        hash.push(signingBlock.getHash());
        //@ts-ignore
        const author = this.get('author') as Author;

        if (author) {
            hash.push(author.toBuffer());
        }

        return BufferWrapper.create(hash.get());
    }
}

//#endregion Internal
//#region Standalone

export class TxnStandalone extends typedStructure({
    'version': Uleb128,
    'type': {
        ...standaloneCreateUser,
        ...standaloneRemoveUser,
        ...standaloneEndorsing,
        ...standaloneDocument,
    }
}) {
    // virtual methods
    public isUserTransaction(): boolean {throw new Error();}
    public isAdminTransaction(): boolean {throw new Error();}
    public async verifyPrepareInputs(context: Context) {throw new Error();}
    public verify(inputs: any): boolean {throw new Error();}

    public getHash() {
        const hash = new HashSum();

        hash.push(this.get('version').toBuffer());
        hash.push(this.get('type').toBuffer());
        hash.push(this.get('data').toBuffer());

        if (this.isUserTransaction()) {
            hash.push(this.get('author').toBuffer());
            hash.push(this.get('signingBlockHash', BlockHash).getValue());
        }
        if (this.isAdminTransaction()) {
            hash.push(this.get('author').toBuffer());
            hash.push(this.get('signingBlockIndex', BlockIndex).toBuffer());
        }

        return BufferWrapper.create(hash.get());
    }
}

//#endregion Standalone