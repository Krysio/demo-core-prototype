import { standaloneByUser, internalByUser, standaloneByAdmin, internalByAdmin } from "./common";
import { Document } from "../Document";
import { TYPE_USER_USER, TYPE_USER_PUBLIC, TYPE_USER_ROOT, TYPE_USER_ADMIN } from "../User";
import { Context } from "@/context";

/******************************/

export const TYPE_TXN_INSERT_DOCUMENT = 48;
export const TYPE_TXN_INSERT_DOCUMENT_BY_ADMIN = 49;

/******************************/

export const standaloneDocument = {
    [TYPE_TXN_INSERT_DOCUMENT]: class TxnInsertDocument extends standaloneByUser({
        'data': Document
    }) {},
    [TYPE_TXN_INSERT_DOCUMENT_BY_ADMIN]: class TxnInsertDocument extends standaloneByAdmin({
        'data': Document
    }) {},
};

class TxnInternalInsertDocument extends internalByUser({
    'data': Document
}) {}
class TxnInternalInsertDocumentByAdmin extends internalByAdmin({
    'data': Document
}) {}

export const internalDocument = {
    [TYPE_TXN_INSERT_DOCUMENT]: TxnInternalInsertDocument,
    [TYPE_TXN_INSERT_DOCUMENT_BY_ADMIN]: TxnInternalInsertDocumentByAdmin,
};

/******************************/

import {
    ruleTxnOnlyEvenBlockIndex,
    ruleTxnSignatureType,
    ruleTxnAuthorUserType,
    ruleTxnVerify,
    ruleTxnApply
} from "@/context/rules";
import { TYPE_TXN_SIGNATURE_ADMIN, TYPE_TXN_SIGNATURE_USER } from "./constants";

ruleTxnOnlyEvenBlockIndex.set(TYPE_TXN_INSERT_DOCUMENT, true);
ruleTxnOnlyEvenBlockIndex.set(TYPE_TXN_INSERT_DOCUMENT_BY_ADMIN, true);
ruleTxnSignatureType.set(TYPE_TXN_INSERT_DOCUMENT, TYPE_TXN_SIGNATURE_USER);
ruleTxnSignatureType.set(TYPE_TXN_INSERT_DOCUMENT_BY_ADMIN, TYPE_TXN_SIGNATURE_ADMIN);
ruleTxnAuthorUserType.set(TYPE_TXN_INSERT_DOCUMENT, [TYPE_USER_USER, TYPE_USER_PUBLIC]);
ruleTxnAuthorUserType.set(TYPE_TXN_INSERT_DOCUMENT_BY_ADMIN, [TYPE_USER_ADMIN, TYPE_USER_ROOT]);

/******************************/

// weryfikacja

import {
} from "@/helper/verifier/user";

ruleTxnVerify.set(TYPE_TXN_INSERT_DOCUMENT, []);
ruleTxnVerify.set(TYPE_TXN_INSERT_DOCUMENT_BY_ADMIN, []);

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
ruleTxnApply.set(TYPE_TXN_INSERT_DOCUMENT_BY_ADMIN, applyInsertDocument);
