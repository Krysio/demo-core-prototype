import { structure } from "../base";
import { Uleb128 } from "../Uleb128";
import { standaloneByUser, internalByUser } from "./common";

export const TYPE_TXN_BIND = 65;

export const internalBind = {
    [TYPE_TXN_BIND]: class TxnBind extends internalByUser({
        'data': structure({
            'userId': Uleb128
        })
    }) {
        verify() {
            // TODO author ma poparcie
            return true;
        }
        apply() {
            // save
        }
    },
};
export const standaloneBind = {
    [TYPE_TXN_BIND]: class TxnBind extends standaloneByUser({
        'data': structure({
            'userId': Uleb128
        })
    }) {
        verify() {
            // TODO author ma poparcie
            return true;
        }
    },
};