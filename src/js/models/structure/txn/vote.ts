import { structure } from "../base";
import { Uleb128, ArrayOfUleb128 } from "../Uleb128";
import { standaloneByUser, internalByUser } from "./common";

export const TYPE_TXN_VOTE = 64;

export const internalVote = {
    [TYPE_TXN_VOTE]: class TxnVote extends internalByUser({
        'data': structure({
            'documentId': Uleb128,
            'votes': ArrayOfUleb128
        })
    }) {},
};
export const standaloneVote = {
    [TYPE_TXN_VOTE]: class TxnVote extends standaloneByUser({
        'data': structure({
            'documentId': Uleb128,
            'votes': ArrayOfUleb128
        })
    }) {},
}

/******************************/

import { TYPE_USER_USER, TYPE_USER_PUBLIC } from "../User";
import {
    ruleTxnSignatureType,
    ruleTxnAuthorUserType,
    ruleTxnVerify
} from "@/context/rules";
import { TYPE_TXN_SIGNATURE_USER } from "./constants";

ruleTxnSignatureType.set(TYPE_TXN_VOTE, TYPE_TXN_SIGNATURE_USER);
ruleTxnAuthorUserType.set(TYPE_TXN_VOTE, [TYPE_USER_USER, TYPE_USER_PUBLIC]);

/******************************/

import {
    userExistInSystem, userIsUserOrPublic
} from "@/helper/verifier/user";

// weryfikacja
ruleTxnVerify.set(TYPE_TXN_VOTE, []);
