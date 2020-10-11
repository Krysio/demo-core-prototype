import { Context } from "@/context";
import { createModule } from "@/libs/Module";
import {
    TxnStandalone,
    Uleb128, BlockHash,
    TYPE_TXN_SIGNATURE_ADMIN,
    TYPE_TXN_SIGNATURE_USER,
    TYPE_TXN_SIGNATURE_GROUP,
    User, Blob
} from "@/models/structure";
import {
    ruleTxnOnlyEvenBlockIndex,
    ruleTxnSignatureType,
    ruleTxnAuthorUserType
} from "../rules";
import { Block } from "@/models/block";
import Time from "@/services/Time";
import BufferWrapper from "@/libs/BufferWrapper";

/******************************/

export default function moduleTxnValidator(ctx: unknown) {
    const context = ctx as Context;

    return createModule(async (
        txn: TxnStandalone
    ) => {
        if (!txn.isValid()) return null;

        const version = txn.getValue('version');
        const type = txn.getValue('type');
        const validAuthorUserTypes = ruleTxnAuthorUserType.get(type);
        const signatureType = ruleTxnSignatureType.get(type);
        const result = { txn, type } as {
            txn: TxnStandalone,
            type: number,
            blockHash?: string,
            blockIndex?: number,
            author?: User,
            authors?: User[]
        };

        // TODO podpisywyany blok istnieje
        const firstTopBlock = context.getTopBlock();
        const secondTopBlock = context.getSecondTopBlock();
        const config = context.getConfig();
        const timeLimit = Math.min(
            5*60e3,
            Math.ceil(config.getDiscreteBlockPeriod() / 2)
        );
        let block: Block;
        // widełki czasowe na podpisanie bloku
        switch (signatureType) {
            case TYPE_TXN_SIGNATURE_ADMIN: {
                const signingBlockIndex = txn.getValue('signingBlockIndex', Uleb128);

                // czy ten block index można teraz podpisywać
                if (firstTopBlock.getIndex() === signingBlockIndex) {
                    block = firstTopBlock;
                } else {
                    if (secondTopBlock.getIndex() === signingBlockIndex) {
                        block = secondTopBlock;
                        if (Time.now() > firstTopBlock.getTime() + timeLimit) {
                            return null;
                        }
                    } else {
                        return null;
                    }
                }

                result.blockIndex = signingBlockIndex;
            } break;
            case TYPE_TXN_SIGNATURE_USER:
            case TYPE_TXN_SIGNATURE_GROUP: {
                const signingBlockHash = txn.get('signingBlockHash', BlockHash).getValue();

                // czy ten block index można teraz podpisywać
                if (
                    BufferWrapper.compare(
                        firstTopBlock.getHash(),
                        signingBlockHash
                    ) === 0
                ) {
                    block = firstTopBlock;
                } else {
                    if (
                        BufferWrapper.compare(
                            secondTopBlock.getHash(),
                            signingBlockHash
                        ) === 0
                    ) {
                        block = secondTopBlock;
                        if (Time.now() > firstTopBlock.getTime() + timeLimit) {
                            return null;
                        }
                    } else {
                        return null;
                    }
                }

                result.blockHash = signingBlockHash.toString('hex');
            } break;
            default: return null;
        }

        // transakcja może trafić tylko do bloku o ideksie parzystym
        if (ruleTxnOnlyEvenBlockIndex.get(type)) {
            if (block.getIndex() % 2) {
                return null;
            }
        }

        // podpis
        switch (signatureType) {
            case TYPE_TXN_SIGNATURE_ADMIN:
            case TYPE_TXN_SIGNATURE_USER: {
                const authorId = txn.getValue('author', Uleb128);
                const signature = txn.get('signature', Blob).getValue();

                if (!signature.length) return null;

                const author = await context.getUserById(authorId) as User;

                // autor nie istnieje
                if (author === null) return null;

                const authorType = author.getValue('type', Uleb128);
                const authorKey = author.get('key');
                const txnHash = txn.getHash();

                // typ autora
                if (validAuthorUserTypes.indexOf(authorType) === -1) return null;
                // weryfikacja podpisu
                if (!authorKey.verify(txnHash, signature)) return null;

                result.author = author;
            } break;
            case TYPE_TXN_SIGNATURE_GROUP: {
                // TODO multipotpis
                const authors = [] as User[];
                result.authors = authors;
            } break;
            default: return null;
        }

        return result;
    });
}
