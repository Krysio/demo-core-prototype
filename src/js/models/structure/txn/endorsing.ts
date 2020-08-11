import { structure } from "../base";
import { Uleb128 } from "../Uleb128";
import { internalByUser, standaloneByUser } from "./common";

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
    }) {
        verify() {
            // TODO user istnieje i jest to user lub public, limit slotów
            return true;
        }
        apply() {
            // save
        }
    },
    [TYPE_TXN_REMOVE_ENDORSING]: class TxnRemoveEndorsing extends internalByUser({
        'data': structure({
            'userId': Uleb128
        })
    }) {
        verify() {
            // TODO id jest na liście poparcia
            return true;
        }
        apply() {
            // save
        }
    },
    [TYPE_TXN_REPLACE_ENDORSING]: class TxnReplaceEndorsing extends internalByUser({
        'data': structure({
            'fromUserId': Uleb128,
            'toUserId': Uleb128
        })
    }) {
        verify() {
            // TODO user istnieje i jest to user lub public
            // TODO id jest na liście poparcia
            return true;
        }
        apply() {
            // save
        }
    }
};

/******************************/

export const externalEndorsing = {
    [TYPE_TXN_INSERT_ENDORSING]: class TxnInsertEndorsing extends standaloneByUser({
        'data': structure({
            'userId': Uleb128
        })
    }) {
        verify() {
            // TODO user istnieje i jest to user lub public, limit slotów
            return true;
        }
    },
    [TYPE_TXN_REMOVE_ENDORSING]: class TxnRemoveEndorsing extends standaloneByUser({
        'data': structure({
            'userId': Uleb128
        })
    }) {
        verify() {
            // TODO id jest na liście poparcia
            return true;
        }
    },
    [TYPE_TXN_REPLACE_ENDORSING]: class TxnReplaceEndorsing extends standaloneByUser({
        'data': structure({
            'fromUserId': Uleb128,
            'toUserId': Uleb128
        })
    }) {
        verify() {
            // TODO user istnieje i jest to user lub public
            // TODO id jest na liście poparcia
            return true;
        }
    }
};
