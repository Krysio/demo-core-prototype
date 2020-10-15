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