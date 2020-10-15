import { structure } from "../base";
import { Uleb128 } from "../Uleb128";
import { standaloneByAdmin } from "./common";
import { User, TYPE_USER_ADMIN, TYPE_USER_ROOT } from "../User";
import { Author } from "../Author";
import { Signature } from "../Signature";
import { Context } from "@/context";

/******************************/

export const TYPE_TXN_REMOVE_USER = 19;

/******************************/

class TxnInternalRemoveUser extends structure({
    'author': Author,
    'data': structure({
        'userId': Uleb128,
        'reason': Uleb128
    }),
    'signature': Signature
}) {
    public apply(context: Context) {
        const userId = this.get('data').getValue('userId');
        context.removeUserById(userId);
    }
}

export const internalRemoveUser = {
    [TYPE_TXN_REMOVE_USER]: TxnInternalRemoveUser
};

export const standaloneRemoveUser = {
    [TYPE_TXN_REMOVE_USER]: class TxnStandaloneRemoveUser extends standaloneByAdmin({
        'data': structure({
            'userId': Uleb128,
            'reason': Uleb128
        })
    }) {}
};

/******************************/

import {
    ruleTxnSignatureType,
    ruleTxnAuthorUserType,
    ruleTxnVerify,
    ruleTxnApply
} from "@/context/rules";
import { TYPE_TXN_SIGNATURE_ADMIN } from "./constants";

/******************************/

import { userExistInSystem, removingAdminHasLowerLevel } from "@/helper/verifier/user";

//TODO zrobić listę dostępnych powodów usunięcia i sprawdzać

ruleTxnSignatureType.set(TYPE_TXN_REMOVE_USER, TYPE_TXN_SIGNATURE_ADMIN);
ruleTxnAuthorUserType.set(TYPE_TXN_REMOVE_USER, [TYPE_USER_ROOT, TYPE_USER_ADMIN]);
ruleTxnVerify.set(TYPE_TXN_REMOVE_USER, [userExistInSystem, removingAdminHasLowerLevel]);

/******************************/

// apply

function applyRemoveUser(
    this: TxnInternalRemoveUser,
    context: Context
) {
    const userId = this.get('data').getValue('userId');
    context.removeUserById(userId);
}

ruleTxnApply.set(TYPE_TXN_REMOVE_USER, applyRemoveUser);
