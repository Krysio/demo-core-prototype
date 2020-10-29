import { structure } from "../base";
import { Uleb128 } from "../Uleb128";
import { standaloneByUser, internalByUser } from "./common";

export const TYPE_TXN_BIND = 65;

export const internalBind = {
    [TYPE_TXN_BIND]: class TxnBind extends internalByUser({
        'data': structure({
            'userId': Uleb128
        })
    }) {},
};
export const standaloneBind = {
    [TYPE_TXN_BIND]: class TxnBind extends standaloneByUser({
        'data': structure({
            'userId': Uleb128
        })
    }) {},
};

/******************************/

import { TYPE_USER_USER, TYPE_USER_PUBLIC } from "../User";
import {
    ruleTxnSignatureType,
    ruleTxnAuthorUserType,
    ruleTxnVerify
} from "@/context/rules";
import { TYPE_TXN_SIGNATURE_USER } from "./constants";

ruleTxnSignatureType.set(TYPE_TXN_BIND, TYPE_TXN_SIGNATURE_USER);
ruleTxnAuthorUserType.set(TYPE_TXN_BIND, [TYPE_USER_USER, TYPE_USER_PUBLIC]);

/******************************/

import {
    userExistInSystem, userIsUserOrPublic
} from "@/helper/verifier/user";

// weryfikacja
ruleTxnVerify.set(TYPE_TXN_BIND, [
    userExistInSystem,
    userIsUserOrPublic
]);
