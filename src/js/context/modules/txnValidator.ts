import { Context } from "@/context";
import { createModule } from "@/libs/Module";
import {
    TxnStandalone,
    Uleb128, BlockHash,
    TYPE_TXN_SIGNATURE_ADMIN,
    TYPE_TXN_SIGNATURE_USER,
    TYPE_TXN_SIGNATURE_GROUP,
    User
} from "@/models/structure";
import { ruleTxnSignatureType, ruleTxnAuthorUserType } from "../rules";

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

        // widełki czasowe na podpisanie bloku
        switch (signatureType) {
            case TYPE_TXN_SIGNATURE_ADMIN: {
                const signingBlockIndex = txn.getValue('signingBlockIndex', Uleb128);
                // TODO czy ten block index można teraz podpisywać
            } break;
            case TYPE_TXN_SIGNATURE_USER:
            case TYPE_TXN_SIGNATURE_GROUP: {
                const signingBlockHash = txn.get('signingBlockHash', BlockHash).getValue();
                // TODO czy ten hash można teraz podpisywać
            } break;
        }

        // podpis
        switch (signatureType) {
            case TYPE_TXN_SIGNATURE_ADMIN:
            case TYPE_TXN_SIGNATURE_USER: {
                const authorId = txn.getValue('author', Uleb128);
                const signature = txn.get('signature').getValue();

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

                return {txn, author};
            } break;
            case TYPE_TXN_SIGNATURE_GROUP: {
                // TODO multipotpis
                const authors = [] as User[];
                return {txn, authors};
            } break;
        }
    });
}
