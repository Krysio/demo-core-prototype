import { Config } from "../Config";
import { structure, typedStructure } from "./Base";
import { Uleb128 } from "./Uleb128";
import { Signature } from "./Signature";
import { Blob } from "./Blob";
import { Hash, BlockHash } from "./Hash";
import { User, TYPE_USER_ADMIN } from "./User";
import { Author } from "./Author";
import { BlockIndex } from "./BlockIndex";
import { Context } from "@/context";
import { TYPE_KEY_Secp256k1 } from "./Key";
import { HashSum } from "@/services/crypto/sha256";
import BufferWrapper from "@/libs/BufferWrapper";
import { Block } from "../Block";
import { Document } from "./Document";
import { TYPE_TXN_INSERT_KEY_ADMIN } from "../transaction";
import { HashList } from "./HashList";

/******************************/

export const TYPE_TXN_INSERT_ROOT_USER = 1;
export const TYPE_TXN_SET_CONFIG = 2;
export const TYPE_TXN_HASH_LIST = 3;
export const TYPE_TXN_INSERT_USER_ADMIN = 16;
export const TYPE_TXN_INSERT_USER_USER = 17;
export const TYPE_TXN_INSERT_USER_PUBLIC = 18;
export const TYPE_TXN_REMOVE_USER = 19;
export const TYPE_TXN_INSERT_DOCUMENT = 48;

/******************************/

const Internal = {
    'author': Author,
    'signature': Signature
};

export class TxnInternal extends typedStructure({
        'type': {
            [TYPE_TXN_INSERT_ROOT_USER]: class TxnInsertRootUser extends structure({
                'data': User
            }) {
                isValid() {
                    const user = this.get('data') as User;
                    return user.isRoot() && super.isValid();
                }
            },
            [TYPE_TXN_SET_CONFIG]: class TxnSetConfig extends structure({
                    'data': Blob
            }) {
                isValid() {
                    return this.getConfig().isValid() && super.isValid();
                }

                getConfig() {
                    return Config.fromBuffer(this.get('data').getValue());
                }

                apply(context: Context) {
                    const data = this.get('data').getValue();
                    const config = Config.fromBuffer(data);

                    context.setConfig(config);
                }
            },
            [TYPE_TXN_HASH_LIST]: class TxnDbHashList extends structure({
                'data': HashList
            }) {},

            //#region insert user
            [TYPE_TXN_INSERT_USER_ADMIN]: class TxnInsertKeyAdmin extends structure({
                'data': User,
                ...Internal
            }) {
                isValid() {
                    const user = this.get('data') as User;
                    return user.isAdmin() && super.isValid();
                }

                async verifyPrepareInputs(
                    context: Context,
                    selfBlock: Block
                ) {
                    const author = await context.getUserById(
                        this.get('author').getValue()
                    );
                    const previousBlock = await context.getBlockByHash(
                        selfBlock.getPreviousBlockHash()
                    );
                    const signingBlock = await context.getBlockByHash(
                        previousBlock.getPreviousBlockHash()
                    );
                    return { author, selfBlock, signingBlock };
                }
                verify(
                    this: this & TxnInternal,
                    inputs: {
                        author: User;
                        selfBlock: Block;
                        signingBlock: Block;
                    }
                ) {
                    if (!this.isValid()) {
                        return false;
                    }

                    // poprawny autor - root lub administrator

                    let { selfBlock, signingBlock } = inputs;
                    const author = inputs.author.asType<typeof TYPE_USER_ADMIN>();

                    if (author === null
                        && !author.isAdminLike()
                    ) {
                        return false;
                    }

                    // TODO userId nie jest zajęty

                    try {
                        const user = this.get('data');

                        if (!user.isType(TYPE_USER_ADMIN)) {
                            return false;
                        } else {
                            if (user.get('type').getValue() !== TYPE_USER_ADMIN) {
                                return false;
                            }

                            if (author.get('level').getValue() + 1 !== user.get('level').getValue()) {
                                return false;
                            }

                            const key = author.get('key');

                            if (key.isType(TYPE_KEY_Secp256k1)) {
                                const hash = this.getHash(selfBlock, signingBlock);
                                const signature = this.get('signature').getValue();

                                if (key.verify(hash, signature) === false) {
                                    return false;
                                }
                            }
                        }

                        return true;
                    } catch (error) {
                        return false;
                    }
                }
            },
            [TYPE_TXN_INSERT_USER_USER]: class TxnInsertKeyAdmin extends structure({
                'data': User,
                ...Internal
            }) {
                isValid() {
                    const user = this.get('data') as User;
                    return user.isUser() && super.isValid();
                }
            },
            [TYPE_TXN_INSERT_USER_PUBLIC]: class TxnInsertKeyAdmin extends structure({
                'data': User,
                ...Internal
            }) {
                isValid() {
                    const user = this.get('data') as User;
                    return user.isPublic() && super.isValid();
                }
            },
            //#endregion
            //#region remove user
            [TYPE_TXN_REMOVE_USER]: class TxnRemoveUser extends structure({
                'data': Uleb128,
                ...Internal
            }) {}
            //#endregion
        }
    }
) {
    apply(context: Context) { }

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

const TxnStandaloneByAdmin = {
    'signingBlockIndex': BlockIndex,
    'author': Author,
    'signature': Signature
};
const TxnStandaloneByUser = {
    'signingBlockHash': BlockHash,
    'author': Author,
    'signature': Signature
}

class TxnInsertUserBase extends structure({
    'data': User,
    ...TxnStandaloneByAdmin
}) {
    public getInsertingUser() {
        return this.get('data');
    }
}

export class TxnStandalone extends typedStructure({
    'version': Uleb128,
    'type': {
        //#region insert user
        [TYPE_TXN_INSERT_USER_ADMIN]: class TxnInsertUserAdmin extends TxnInsertUserBase {
            isValid() {
                const user = this.getInsertingUser();
                return user.isAdmin() && super.isValid();
            }
        },
        [TYPE_TXN_INSERT_USER_USER]: class TxnInsertUserUser extends TxnInsertUserBase {
            isValid() {
                const user = this.getInsertingUser();
                return user.isUser() && super.isValid();
            }
        },
        [TYPE_TXN_INSERT_USER_PUBLIC]: class TxnInsertUserPublic extends TxnInsertUserBase {
            isValid() {
                const user = this.getInsertingUser();
                return user.isPublic() && super.isValid();
            }
        },
        //#endregion

        //#region remove user
        [TYPE_TXN_REMOVE_USER]: class TxnRemoveUser extends structure({
            'data': structure({
                'userId': Uleb128,
                'reason': Uleb128
            }),
            ...TxnStandaloneByAdmin
        }) {},
        //#endregion

        [TYPE_TXN_INSERT_DOCUMENT]: class TxnInsertDocument extends structure({
            'data': Document,
            ...TxnStandaloneByUser
        }) {}
    }
}) {
    getHash() {
        const hash = new HashSum();

        hash.push(this.get('version').toBuffer());
        hash.push(this.get('type').toBuffer());
        hash.push(this.get('data').toBuffer());

        if (this.has('signingBlockHash')) {
            hash.push(this.get('author').toBuffer());
            hash.push(this.get('signingBlockHash', BlockHash).getValue());
        }
        if (this.has('signingBlockIndex')) {
            hash.push(this.get('author').toBuffer());
            hash.push(this.get('signingBlockIndex', BlockIndex).toBuffer());
        }

        return BufferWrapper.create(hash.get());
    }
}
