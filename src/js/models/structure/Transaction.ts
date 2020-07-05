import { Config } from "../Config";
import { Base, structure, typedStructure } from "./base";
import { Uleb128 } from "./Uleb128";
import { Signature } from "./Signature";
import { Blob } from "./Blob";
import { Hash, BlockHash } from "./Hash";
import { User, TYPE_USER_ADMIN, TYPE_USER_ROOT } from "./User";
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

class TxnInternalInsertUser extends structure({
    'data': User,
    'author': Author,
    'signature': Signature
}) {
    async verifyPrepareInputs(
        context: Context,
        selfBlock: Block
    ) {
        const author = await context.getUserById(
            this.get('author').getValue()
        );
        const userById = await context.getUserById(
            this.get('data').get('userId', Uleb128).getValue()
        );
        const previousBlock = await context.getBlockByHash(
            selfBlock.getPreviousBlockHash()
        );
        const signingBlock = await context.getBlockByHash(
            previousBlock.getPreviousBlockHash()
        );
        return { author, userById, selfBlock, signingBlock };
    }
    verify(inputs: {
        author: User;
        userById: User;
        selfBlock: Block;
        signingBlock: Block;
    }) {
        const user = this.get('data');
        const author = inputs.author.asType(TYPE_USER_ADMIN);

        if (inputs.userById !== null) {
            return false;
        }
        if (user.isType(TYPE_USER_ADMIN)) {
            if (author.getValue('level') >= user.getValue('level')) {
                return false;
            }
        }

        // podpis

        const key = author.get('key');
        const hash = this.getHash(
            inputs.selfBlock,
            inputs.signingBlock,
            author.isAdminLike() ? 'index' : 'hash'
        );
        const signature = this.get('signature').getValue();

        if (key.verify(hash, signature) === false) {
            return false;
        }

        return true;
    }
    getHash(
        selfBlock: Block,
        signingBlock: Block,
        signingValue: 'index' | 'hash'
    ) {
        const hash = new HashSum();

        hash.push(selfBlock.get('version').toBuffer());
        hash.push(this.get('type', Uleb128).toBuffer());
        hash.push(this.get('data').toBuffer());

        if (signingValue === 'hash') {
            hash.push(this.get('author').toBuffer());
            hash.push(signingBlock.getHash());
        }
        if (signingValue === 'index') {
            hash.push(this.get('author').toBuffer());
            hash.push(signingBlock.get('index').toBuffer());
        }

        return BufferWrapper.create(hash.get());
    }
    apply(context: Context) {
        const user = this.get('data', User);
        const userId = user.getValue('userId', Uleb128);

        context.storeUserWithId(userId, user.toBuffer());
    }
}

export class TxnInternal extends typedStructure({
        'type': {
            [TYPE_TXN_INSERT_ROOT_USER]: class TxnInsertRootUser extends structure({
                'data': User
            }) {
                isValid() {
                    const user = this.get('data') as User;
                    return user.isRoot() && super.isValid();
                }

                apply(context: Context) {
                    const data = this.get('data').toBuffer();

                    if (data !== null) {
                        context.storeUserWithId(0, data);
                    }
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
            }) {
                apply(context: Context) {}
            },

            //#region insert user
            [TYPE_TXN_INSERT_USER_ADMIN]: class TxnInsertUserAdmin extends TxnInternalInsertUser {
                isValid() {
                    const user = this.get('data') as User;
                    return user.isAdmin() && super.isValid();
                }
            },
            [TYPE_TXN_INSERT_USER_USER]: class TxnInsertUserUser extends TxnInternalInsertUser {
                isValid() {
                    const user = this.get('data') as User;
                    return user.isUser() && super.isValid();
                }
            },
            [TYPE_TXN_INSERT_USER_PUBLIC]: class TxnInsertUserPublic extends TxnInternalInsertUser {
                isValid() {
                    const user = this.get('data') as User;
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
                'author': Author,
                'signature': Signature
            }) {
                apply(context: Context) {
                    const userId = this.get('data').getValue('userId');
                    context.removeUserById(userId);
                }
            }
            //#endregion
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

function txnByAdmin<S extends {[K in keyof S]: S[K]}>(schema: S) {
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

function txnByUser<S extends {[K in keyof S]: S[K]}>(schema: S) {
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
    };
}

class TxnInsertUserBase extends txnByAdmin({
    'data': User
}) {
    public verify(inputs: {
        author: User;
        userById: User;
    }) {
        if (inputs.userById !== null) {
            return false;
        }
        return super.verify(inputs);
    }
    async verifyPrepareInputs(context: Context) {
        const author = await context.getUserById(
            this.getValue('author')
        );
        const userById = await context.getUserById(
            this.get('data', User)
            .getValue('userId', Uleb128)
        );
        return { author, userById };
    }
    public getInsertingUser() {
        return this.get('data');
    }
}

export class TxnStandalone extends typedStructure({
    'version': Uleb128,
    'type': {
        //#region insert user
        [TYPE_TXN_INSERT_USER_ADMIN]: class TxnInsertUserAdmin extends TxnInsertUserBase {
            verify(
                this: TxnStandalone & this,
                inputs: {
                    author: User;
                    userById: User;
                }
            ) {
                // dziedziczenie
                if (!super.verify(inputs)) {
                    return false;
                }

                const author = inputs.author.asType(TYPE_USER_ADMIN);
                const user = this.get('data', User);

                // wstawiany typ: admin
                if (!user.isType(TYPE_USER_ADMIN)) {
                    return false;
                }
                // dodawany admin tylko niższej rangi
                if (author.getValue('level') >= user.getValue('level')) {
                    return false;
                }
                // podpis
                if (!author.get('key').verify(
                    this.getHash(),
                    this.getValue('signature')
                )) {
                    return false;
                }

                return true;
            }
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
        [TYPE_TXN_REMOVE_USER]: class TxnRemoveUser extends txnByAdmin({
            'data': structure({
                'userId': Uleb128,
                'reason': Uleb128
            })
        }) {},
        //#endregion

        [TYPE_TXN_INSERT_DOCUMENT]: class TxnInsertDocument extends txnByUser({
            'data': Document
        }) {}
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
