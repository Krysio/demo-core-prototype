import { Config } from "../Config";
import { BaseStructure } from "./Base";
import { defineTypes } from "./typed";
import { Uleb128 } from "./Uleb128";
import { Signature } from "./Signature";
import { Blob } from "./Blob";
import { Hash, BlockHash } from "./Hash";
import { User } from "./User";
import { Author } from "./Author";
import { BlockIndex } from "./BlockIndex";

/******************************/

const Internal = {
    'author': Author,
    'signature': Signature
};

export class TxnInternal extends BaseStructure {
    protected schema = {
        'type': defineTypes({
            1: class TxnInsertRootUser extends TxnInternal {
                protected schema = {
                    'data': User
                };

                isValid() {
                    const user = this.get('data') as User;
                    return user.isRoot() && super.isValid();
                }
            },
            2: class TxnSetConfig extends TxnInternal {
                protected schema = {
                    'data': Blob
                };

                isValid() {
                    return this.getConfig().isValid() && super.isValid();
                }

                getConfig() {
                    return Config.fromBuffer(this.get('data').getValue());
                }
            },
            3: class TxnDbHashList extends TxnInternal {
                protected schema = {
                    'keys': Hash
                };
            },

            //#region insert user
            16: class TxnInsertKeyAdmin extends TxnInternal {
                protected schema = {
                    'data': User,
                    ...Internal
                }

                isValid() {
                    const user = this.get('data') as User;
                    return user.isAdmin() && super.isValid();
                }
            },
            17: class TxnInsertKeyAdmin extends TxnInternal {
                protected schema = {
                    'data': User,
                    ...Internal
                }

                isValid() {
                    const user = this.get('data') as User;
                    return user.isUser() && super.isValid();
                }
            },
            18: class TxnInsertKeyAdmin extends TxnInternal {
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
            19: class TxnRemoveUser extends TxnInternal {
                protected schema = {
                    'data': Uleb128,
                    ...StandaloneFromAdmin
                }
            },
            //#endregion
        })
    };
}

const StandaloneFromAdmin = {
    'signingBlockIndex': BlockIndex,
    'author': Author,
    'signature': Signature
};
const StandaloneFromUser = {
    'signingBlockHash': BlockHash,
    'author': Author,
    'signature': Signature
};

export class TxnStandalone extends BaseStructure {
    protected schema = {
        'version': Uleb128,
        'type': defineTypes({
            //#region insert user
            16: class TxnInsertKeyAdmin extends TxnStandalone {
                protected schema = {
                    'data': User,
                    ...StandaloneFromAdmin
                }

                isValid() {
                    const user = this.get('data') as User;
                    return user.isAdmin() && super.isValid();
                }
            },
            17: class TxnInsertKeyUser extends TxnStandalone {
                protected schema = {
                    'data': User,
                    ...StandaloneFromAdmin
                }

                isValid() {
                    const user = this.get('data') as User;
                    return user.isUser() && super.isValid();
                }
            },
            18: class TxnInsertKeyPublic extends TxnStandalone {
                protected schema = {
                    'data': User,
                    ...StandaloneFromAdmin
                }

                isValid() {
                    const user = this.get('data') as User;
                    return user.isPublic() && super.isValid();
                }
            },
            //#endregion
            //#region remove user
            19: class TxnRemoveUser extends TxnStandalone {
                protected schema = {
                    'data': Uleb128,
                    ...StandaloneFromAdmin
                }
            },
            //#endregion

            48: class TxnInsertDocument extends TxnStandalone {
                protected schema = {
                    'data': 'Document',
                    ...StandaloneFromUser
                };
            }
        })
    };
};
