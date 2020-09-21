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
export const standaloneVote = {

}