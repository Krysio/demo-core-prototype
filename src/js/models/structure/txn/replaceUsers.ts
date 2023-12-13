import { structure } from "../base";
import { Uleb128, ArrayOfUleb128 } from "../Uleb128";
import { BlockHash } from "../Hash";
import { ArrayOfBlob } from "../Blob";
import { Context } from "@/context";

export const TYPE_TXN_REPLACE_USERS = 112;

class TxnInternalReplaceUsers extends structure({
    'data': structure({
        'timeEnd': Uleb128,
        'level': Uleb128,
        'users': ArrayOfShadowUser
    }),
    'authors': ArrayOfUleb128,
    'signatures': ArrayOfBlob
}) {}
export const internalReplaceUsers = {
    [TYPE_TXN_REPLACE_USERS]: TxnInternalReplaceUsers,
};
export const standaloneReplaceUsers = {
    [TYPE_TXN_REPLACE_USERS]: class TxnReplaceUsers extends structure({
        'data': structure({
            'timeEnd': Uleb128,
            'level': Uleb128,
            'users': ArrayOfShadowUser
        }),
        'authors': ArrayOfUleb128,
        'signingBlockHash': BlockHash,
        'signatures': ArrayOfBlob
    }) {},
}

/******************************/

import { ArrayOfShadowUser, TYPE_USER_USER } from "../User";
import {
    ruleTxnSignatureType,
    ruleTxnAuthorUserType,
    ruleTxnVerify,
    ruleTxnApply
} from "@/context/rules";
import { TYPE_TXN_SIGNATURE_GROUP } from "./constants";

ruleTxnSignatureType.set(TYPE_TXN_REPLACE_USERS, TYPE_TXN_SIGNATURE_GROUP);
ruleTxnAuthorUserType.set(TYPE_TXN_REPLACE_USERS, [TYPE_USER_USER]);

/******************************/

// weryfikacja

import { userNotExistInSystem, insertingAdminHasLowerLevel } from "@/helper/verifier/user";
import { Key } from "../Key";


// TODO
// poprawny poziom kazdego uzytkownika
// poprawny dyskretny czas
// kazdy uzytkownik ma poprawny timeEnd
// id'iki nie są pozajmowane

ruleTxnVerify.set(TYPE_TXN_REPLACE_USERS, []);

// apply


function applyRemoveUser(
    this: TxnInternalReplaceUsers,
    context: Context
) {
    const timeStart = Date.now();
    const data = this.get('data');
    const level = data.getValue('level');
    const timeEnd = data.getValue('timeEnd');
    const protoUserList = data.getValue('users');
    const authorList = this.getValue('authors');

    for (const userId of authorList) {
        context.module.userSuspend.in({
            userId, timeEnd,
        });
    }

    for (const protoUser of protoUserList) {
        const userId = protoUser.getValue('userId');
        const key = protoUser.get('key', Key);

        context.module.userCreate.in({
            userId, key,
            level, timeStart, timeEnd
        });
    }
}

ruleTxnApply.set(TYPE_TXN_REPLACE_USERS, applyRemoveUser);
