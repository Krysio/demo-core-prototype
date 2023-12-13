import { typedStructure } from "./base";
import { ArrayOfUleb128, Uleb128 } from "./Uleb128";
import { BlockHash } from "./Hash";
import { Author } from "./Author";
import { BlockIndex } from "./BlockIndex";
import { Block } from "../Block";
import { HashSum } from "@/services/crypto/sha256";
import BufferWrapper from "@/libs/BufferWrapper";
import {
    ruleTxnSignatureType
} from "@/context/rules";
import { TYPE_TXN_SIGNATURE_ADMIN, TYPE_TXN_SIGNATURE_GROUP, TYPE_TXN_SIGNATURE_USER } from "./txn/constants";

import {
    internalInitial,
    internalCreateUser, standaloneCreateUser,
    internalRemoveUser, standaloneRemoveUser,
    internalDocument, standaloneDocument,
    internalBind, standaloneBind,
    internalVote, standaloneVote,
    internalReplaceUsers, standaloneReplaceUsers
} from "./txn";

/******************************/

//#region Internal

export class TxnInternal extends typedStructure({
        'type': {
            ...internalInitial,
            ...internalCreateUser,
            ...internalRemoveUser,
            ...internalDocument,
            ...internalBind,
            ...internalVote,
            ...internalReplaceUsers
        }
    }
) {
    getHash(
        selfBlock: Block,
        signingBlock: Block
    ) {
        const hash = new HashSum();
        const type = this.getValue('type');
        const signatureType = ruleTxnSignatureType.get(type);

        hash.push(selfBlock.get('version').toBuffer());
        hash.push(this.get('type').toBuffer());
        hash.push(this.get('data').toBuffer());

        switch (signatureType) {
            case TYPE_TXN_SIGNATURE_ADMIN: {
                hash.push(this.get('author', Author).toBuffer());
                hash.push(signingBlock.get('index').toBuffer());
            } break;
            case TYPE_TXN_SIGNATURE_USER: {
                hash.push(this.get('author', Author).toBuffer());
                hash.push(signingBlock.getHash());
            } break;
            case TYPE_TXN_SIGNATURE_GROUP: {
                hash.push(this.get('authors', ArrayOfUleb128).toBuffer());
                hash.push(signingBlock.getHash());
            } break;
            default: {
                hash.push(signingBlock.getHash());
            }
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
        ...standaloneDocument,
        ...standaloneBind,
        ...standaloneVote,
        ...standaloneReplaceUsers
    }
}) {
    // virtual methods
    public isUserTransaction(): boolean {throw new Error();}
    public isAdminTransaction(): boolean {throw new Error();}
    public getHash() {
        const hash = new HashSum();
        const type = this.getValue('type');
        const signatureType = ruleTxnSignatureType.get(type);

        hash.push(this.get('version').toBuffer());
        hash.push(this.get('type').toBuffer());
        hash.push(this.get('data').toBuffer());

        switch (signatureType) {
            case TYPE_TXN_SIGNATURE_ADMIN: {
                hash.push(this.get('author', Author).toBuffer());
                hash.push(this.get('signingBlockIndex', BlockIndex).toBuffer());
            } break;
            case TYPE_TXN_SIGNATURE_USER: {
                hash.push(this.get('author', Author).toBuffer());
                hash.push(this.get('signingBlockHash', BlockHash).getValue());
            } break;
            case TYPE_TXN_SIGNATURE_GROUP: {
                hash.push(this.get('authors', ArrayOfUleb128).toBuffer());
                hash.push(this.get('signingBlockHash', BlockHash).getValue());
            } break;
        }

        return BufferWrapper.create(hash.get());
    }
}

//#endregion Standalone
 
if (process.env.NODE_ENV === 'development') {
    window['dev'] = {...(window['dev'] || {}), ...{
        TxnInternal, TxnStandalone, 
    }};
}