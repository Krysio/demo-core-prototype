import { standaloneByUser, internalByUser } from "./common";
import { Document } from "../Document";
import { TYPE_USER_USER, TYPE_USER_PUBLIC, TYPE_USER_ROOT } from "../User";
import { Context } from "@/context";

/******************************/

export const TYPE_TXN_INSERT_DOCUMENT = 48;

/******************************/

export const standaloneDocument = {
    [TYPE_TXN_INSERT_DOCUMENT]: class TxnInsertDocument extends standaloneByUser({
        'data': Document
    }) {
        verify() {
            // TODO author ma poparcie
            return true;
        }
    },
};

class TxnInternalInsertDocument extends internalByUser({
    'data': Document
}) {
    verify() {
        // TODO author ma poparcie
        return true;
    }
    apply() {
        // save
    }
}

export const internalDocument = {
    [TYPE_TXN_INSERT_DOCUMENT]: TxnInternalInsertDocument,
};

/******************************/

import {
    ruleTxnOnlyEvenBlockIndex,
    ruleTxnSignatureType,
    ruleTxnAuthorUserType,
    ruleTxnVerify,
    ruleTxnApply
} from "@/context/rules";
import { TYPE_TXN_SIGNATURE_USER } from "./constants";

ruleTxnOnlyEvenBlockIndex.set(TYPE_TXN_INSERT_DOCUMENT, true);
ruleTxnSignatureType.set(TYPE_TXN_INSERT_DOCUMENT, TYPE_TXN_SIGNATURE_USER);
ruleTxnAuthorUserType.set(TYPE_TXN_INSERT_DOCUMENT, [TYPE_USER_USER, TYPE_USER_PUBLIC, TYPE_USER_ROOT]);

/******************************/

// weryfikacja

import {
} from "@/helper/verifier/user";

ruleTxnVerify.set(TYPE_TXN_INSERT_DOCUMENT, []);

/******************************/

// apply

function applyInsertDocument(
    this: TxnInternalInsertDocument,
    context: Context
) {
    const document = this.get('data', Document);
    context.module.documentInsert.in(document);
}

ruleTxnApply.set(TYPE_TXN_INSERT_DOCUMENT, applyInsertDocument);
