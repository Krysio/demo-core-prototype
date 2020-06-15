import {
    BaseStructure, defineTypes,
    Uleb128, Signature,
    User, BlockHash, BlockIndex, Author
} from "@/models/structure";

/******************************/

export class TxnInternal extends BaseStructure {
    protected schema = [
        ['type', defineTypes({
            1: class TxnInsertRootUser extends TxnStandalone {
                protected schema = [
                    ['data', User]
                ];

                isValid() {
                    const user = this.get('data') as User;
                    return user.isRoot() && super.isValid();
                }
            }
        })]
    ];
}

export class TxnStandalone extends BaseStructure {
    protected schema = [
        ['version', Uleb128],
        ['type', defineTypes({
            16: class TxnInsertKeyAdmin extends TxnStandalone {
                protected schema = [
                    ['data', User],
                    ['signingBlockIndex', BlockIndex],
                    ['author', Author],
                    ['signature', Signature]
                ]
            },
            48: class TxnInsertDocument extends TxnStandalone {
                protected schema = [
                    ['data', 'Document'],
                    ['signingBlockHash', BlockHash],
                    ['author', Author],
                    ['signature', Signature]
                ];
            }
        })]
    ];
    static virtual: [
        ['hash', 'HashTxn']
    ];
};
