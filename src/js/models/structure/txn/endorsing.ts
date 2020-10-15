import { structure } from "../base";
import { Uleb128 } from "../Uleb128";
import { internalByUser, standaloneByUser } from "./common";
import { Context } from "@/context";
import { User, TYPE_USER_USER, TYPE_USER_PUBLIC } from "../User";
import { Config } from "../../Config";

/******************************/

export const TYPE_TXN_INSERT_ENDORSING = 86;
export const TYPE_TXN_REMOVE_ENDORSING = 87;
export const TYPE_TXN_REPLACE_ENDORSING = 88;

/******************************/

export const internalEndoring = {
    [TYPE_TXN_INSERT_ENDORSING]: class TxnInsertEndorsing extends internalByUser({
        'data': structure({
            'userId': Uleb128
        })
    }) {},
    [TYPE_TXN_REMOVE_ENDORSING]: class TxnRemoveEndorsing extends internalByUser({
        'data': structure({
            'userId': Uleb128
        })
    }) {},
    [TYPE_TXN_REPLACE_ENDORSING]: class TxnReplaceEndorsing extends internalByUser({
        'data': structure({
            'fromUserId': Uleb128,
            'toUserId': Uleb128
        })
    }) {}
};

/******************************/

async function prepareInputs(context: Context) {
    const user = await context.getUserById(this.get('data').getValue('userId'));
    const edorsingList = await context.getUserEndorsingListById(this.getValue('author'));
    const config = context.getConfig();

    return { user, edorsingList, config };
}

export const standaloneEndorsing = {
    [TYPE_TXN_INSERT_ENDORSING]: class TxnInsertEndorsing extends standaloneByUser({
        'data': structure({
            'userId': Uleb128
        })
    }) {},
    [TYPE_TXN_REMOVE_ENDORSING]: class TxnRemoveEndorsing extends standaloneByUser({
        'data': structure({
            'userId': Uleb128
        })
    }) {},
    [TYPE_TXN_REPLACE_ENDORSING]: class TxnReplaceEndorsing extends standaloneByUser({
        'data': structure({
            'fromUserId': Uleb128,
            'userId': Uleb128
        })
    }) {}
};

/******************************/

import {
    ruleTxnOnlyEvenBlockIndex,
    ruleTxnSignatureType,
    ruleTxnAuthorUserType,
    ruleTxnVerify
} from "@/context/rules";
import { TYPE_TXN_SIGNATURE_USER } from "./constants";

ruleTxnOnlyEvenBlockIndex.set(TYPE_TXN_INSERT_ENDORSING, true);
ruleTxnOnlyEvenBlockIndex.set(TYPE_TXN_REMOVE_ENDORSING, true);
ruleTxnOnlyEvenBlockIndex.set(TYPE_TXN_REPLACE_ENDORSING, true);

ruleTxnSignatureType.set(TYPE_TXN_INSERT_ENDORSING, TYPE_TXN_SIGNATURE_USER);
ruleTxnSignatureType.set(TYPE_TXN_REMOVE_ENDORSING, TYPE_TXN_SIGNATURE_USER);
ruleTxnSignatureType.set(TYPE_TXN_REPLACE_ENDORSING, TYPE_TXN_SIGNATURE_USER);

ruleTxnAuthorUserType.set(TYPE_TXN_INSERT_ENDORSING, [TYPE_USER_USER, TYPE_USER_PUBLIC]);
ruleTxnAuthorUserType.set(TYPE_TXN_REMOVE_ENDORSING, [TYPE_USER_USER, TYPE_USER_PUBLIC]);
ruleTxnAuthorUserType.set(TYPE_TXN_REPLACE_ENDORSING, [TYPE_USER_USER, TYPE_USER_PUBLIC]);

/******************************/

// weryfikacja

import {
    userExistInSystem, userIsUserOrPublic
} from "@/helper/verifier/user";

ruleTxnVerify.set(TYPE_TXN_INSERT_ENDORSING, [userExistInSystem, userIsUserOrPublic]);
ruleTxnVerify.set(TYPE_TXN_REMOVE_ENDORSING, []);
ruleTxnVerify.set(TYPE_TXN_REPLACE_ENDORSING, [userExistInSystem, userIsUserOrPublic]);

// TODO id jest na liście poparcia
