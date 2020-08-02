import { structure, typedStructure } from "./base";
import { Uleb128 } from "./Uleb128";
import { BlockHash } from "./Hash";
import { Author } from "./Author";
import { Signature } from "./Signature";
import { BlockIndex } from "./BlockIndex";
import { Block } from "../Block";
import { Document } from "./Document";

import { Context } from "@/context";
import { HashSum } from "@/services/crypto/sha256";
import BufferWrapper from "@/libs/BufferWrapper";

import {
    standaloneByUser, internalByUser,
    internalInitial,
    internalCreateUser, standaloneCreateUser,
    internalRemoveUser, standaloneRemoveUser
} from "./txn";

/******************************/

export const TYPE_TXN_INSERT_DOCUMENT = 48;
export const TYPE_TXN_INSERT_ENDORSING = 86;
export const TYPE_TXN_REMOVE_ENDORSING = 87;
export const TYPE_TXN_REPLACE_ENDORSING = 88;

/******************************/

//#region Internal

export class TxnInternal extends typedStructure({
        'type': {
            ...internalInitial,
            ...internalCreateUser,
            ...internalRemoveUser,

            [TYPE_TXN_INSERT_DOCUMENT]: class TxnInsertDocument extends internalByUser({
                'data': Document
            }) {
                verify() {
                    // TODO author ma poparcie
                    return true;
                }
                apply() {
                    // save
                }
            },

            [TYPE_TXN_INSERT_ENDORSING]: class TxnInsertEndorsing extends internalByUser({
                'userId': Uleb128
            }) {
                verify() {
                    // TODO user istnieje i jest to user lub public, limit slotów
                    return true;
                }
                apply() {
                    // save
                }
            },
            [TYPE_TXN_REMOVE_ENDORSING]: class TxnRemoveEndorsing extends internalByUser({
                'userId': Uleb128
            }) {
                verify() {
                    // TODO id jest na liście poparcia
                    return true;
                }
                apply() {
                    // save
                }
            },
            [TYPE_TXN_REPLACE_ENDORSING]: class TxnReplaceEndorsing extends internalByUser({
                'fromUserId': Uleb128,
                'toUserId': Uleb128
            }) {
                verify() {
                    // TODO user istnieje i jest to user lub public
                    // TODO id jest na liście poparcia
                    return true;
                }
                apply() {
                    // save
                }
            }
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

        [TYPE_TXN_INSERT_DOCUMENT]: class TxnInsertDocument extends standaloneByUser({
            'data': Document
        }) {
            verify() {
                // TODO author ma poparcie
                return true;
            }
        },

        [TYPE_TXN_INSERT_ENDORSING]: class TxnInsertEndorsing extends standaloneByUser({
            'userId': Uleb128
        }) {
            verify() {
                // TODO user istnieje i jest to user lub public, limit slotów
                return true;
            }
        },
        [TYPE_TXN_REMOVE_ENDORSING]: class TxnRemoveEndorsing extends standaloneByUser({
            'userId': Uleb128
        }) {
            verify() {
                // TODO id jest na liście poparcia
                return true;
            }
        },
        [TYPE_TXN_REPLACE_ENDORSING]: class TxnReplaceEndorsing extends standaloneByUser({
            'fromUserId': Uleb128,
            'toUserId': Uleb128
        }) {
            verify() {
                // TODO user istnieje i jest to user lub public
                // TODO id jest na liście poparcia
                return true;
            }
        }
    }
}) {
    isUserTransaction(): boolean {throw new Error();}
    isAdminTransaction(): boolean {throw new Error();}
    verifyPrepareInputs(context: Context) {return {};}
    verify(inputs: any): boolean {throw new Error();}
    getHash() {
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