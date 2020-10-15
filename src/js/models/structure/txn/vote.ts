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