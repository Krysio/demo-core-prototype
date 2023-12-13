import { TxnStandalone } from "../Transaction";
import { User } from "../User";


export const TYPE_TXN_SIGNATURE_ADMIN = 1;
export const TYPE_TXN_SIGNATURE_USER = 2;
export const TYPE_TXN_SIGNATURE_GROUP = 3;
export type TypeTxnStandaloneScope = {
    txn: TxnStandalone,
    type: number,
    blockHash?: string,
    blockIndex?: number,
    author?: User,
    authors?: User[]
};
