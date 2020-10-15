import { typedStructure } from "./base";
import { Uleb128 } from "./Uleb128";
import { BlockHash } from "./Hash";
import { Author } from "./Author";
import { BlockIndex } from "./BlockIndex";
import { Block } from "../Block";
import { HashSum } from "@/services/crypto/sha256";
import BufferWrapper from "@/libs/BufferWrapper";

import {
    internalInitial,
    internalCreateUser, standaloneCreateUser,
    internalRemoveUser, standaloneRemoveUser,
    internalEndoring, standaloneEndorsing,
    internalDocument, standaloneDocument,
    internalBind, standaloneBind,
    internalVote, standaloneVote
} from "./txn";

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
        ...standaloneBind,
        ...standaloneVote,
    }
}) {
    // virtual methods
    public isUserTransaction(): boolean {throw new Error();}
    public isAdminTransaction(): boolean {throw new Error();}
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