import { Config } from "../Config";
import { BaseStructure } from "./Base";
import { defineTypes } from "./typed";
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
import { Block } from "../block";
import { TYPE_TXN_INSERT_KEY_ADMIN } from "../transaction";

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

export class TxnInternal extends BaseStructure {
    protected schema = {
        'type': defineTypes({
            [TYPE_TXN_INSERT_ROOT_USER]: class TxnInsertRootUser extends TxnInternal {
                protected schema = {
                    'data': User
                };

                isValid() {
                    const user = this.get('data') as User;
                    return user.isRoot() && super.isValid();
                }
            },
            [TYPE_TXN_SET_CONFIG]: class TxnSetConfig extends TxnInternal {
                protected schema = {
                    'data': Blob
                };

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
            [TYPE_TXN_HASH_LIST]: class TxnDbHashList extends TxnInternal {
                protected schema = {
                    'data': {
                        'keys': Hash
                    }
                };
            },

            //#region insert user
            [TYPE_TXN_INSERT_USER_ADMIN]: class TxnInsertKeyAdmin extends TxnInternal {
                protected schema = {
                    'data': User,
                    ...Internal
                }

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
                verify(inputs: {
                    author: User;
                    selfBlock: Block;
                    signingBlock: Block;
                }) {
                    if (!this.isValid()) {
                        return false;
                    }

                    // poprawny autor - root lub administrator

                    const { author, selfBlock, signingBlock } = inputs;

                    if (author === null
                        && !author.isAdminLike()
                    ) {
                        return false;
                    }

                    // TODO userId nie jest zajęty

                    try {
                        const user = this.get('data');
                        if (user.get('type').getValue() !== TYPE_USER_ADMIN) {
                            return false;
                        }

                        if (author.get('level').getValue() + 1 !== user.get('level').getValue()) {
                            return false;
                        }

                        const key = author.get('key').getValue();
                        if (key.get('type').getValue() === TYPE_KEY_Secp256k1) {
                            const hash = this.getHash(selfBlock, signingBlock);
                            const signature = this.get('signature').getValue();

                            if (key.verify(hash, signature) === false) {
                                return false;
                            }
                        }

                        return true;
                    } catch (error) {
                        return false;
                    }
                }
            },
            [TYPE_TXN_INSERT_USER_USER]: class TxnInsertKeyAdmin extends TxnInternal {
                protected schema = {
                    'data': User,
                    ...Internal
                }

                isValid() {
                    const user = this.get('data') as User;
                    return user.isUser() && super.isValid();
                }
            },
            [TYPE_TXN_INSERT_USER_PUBLIC]: class TxnInsertKeyAdmin extends TxnInternal {
                protected schema = {
                    'data': User,
                    ...Internal
                }

                isValid() {
                    const user = this.get('data') as User;
                    return user.isPublic() && super.isValid();
                }
            },
            //#endregion
            //#region remove user
            [TYPE_TXN_REMOVE_USER]: class TxnRemoveUser extends TxnInternal {
                protected schema = {
                    'data': Uleb128,
                    ...Internal
                }
            },
            //#endregion
        })
    };

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
        const author = this.get('author');
        if (author) {
            hash.push(author.toBuffer());
        }

        return BufferWrapper.create(hash.get());
    }
}

abstract class BaseTxnStandalone extends BaseStructure {
    protected prepareHash(
        hash: HashSum
    ) {
        hash.push(this.get('version').toBuffer());
        hash.push(this.get('type').toBuffer());
        hash.push(this.get('data').toBuffer());
    }
    getHash() {
        const hash = new HashSum();

        this.prepareHash(hash);
        return BufferWrapper.create(hash.get());
    }
}

abstract class BaseTxnStandaloneFromAdmin extends BaseTxnStandalone {
    static schemaSuffix = {
        'signingBlockIndex': BlockIndex,
        'author': Author,
        'signature': Signature
    };

    protected prepareHash(
        hash: HashSum
    ) {
        hash.push(this.get('author').toBuffer());
        hash.push(this.get('signingBlockIndex').toBuffer());
    }
}

abstract class BaseTxnStandaloneFromUser extends BaseTxnStandalone {
    static schemaSuffix = {
        'signingBlockHash': BlockHash,
        'author': Author,
        'signature': Signature
    };

    protected prepareHash(
        hash: HashSum
    ) {
        hash.push(this.get('author').toBuffer());
        hash.push(this.get('signingBlockHash').getValue());
    }
}

abstract class TxnInsertUserBase extends BaseTxnStandaloneFromAdmin {
    protected schema = {
        'data': User,
        ...BaseTxnStandaloneFromAdmin.schemaSuffix
    }

    public getInsertingUser() {
        return this.get('data') as unknown as User;
    }
}

export class TxnStandalone extends BaseTxnStandalone {
    protected schema = {
        'version': Uleb128,
        'type': defineTypes({

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
            [TYPE_TXN_REMOVE_USER]: class TxnRemoveUser extends BaseTxnStandaloneFromAdmin {
                protected schema = {
                    'data': Uleb128,
                    ...BaseTxnStandaloneFromAdmin.schemaSuffix
                }
            },
            //#endregion

            [TYPE_TXN_INSERT_DOCUMENT]: class TxnInsertDocument extends BaseTxnStandaloneFromUser {
                protected schema = {
                    'data': 'Document',
                    ...BaseTxnStandaloneFromUser.schemaSuffix
                };
            }
        })
    };
};
