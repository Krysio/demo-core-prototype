import { Context } from "@/context";
import { TxnStandalone, TypeTxnStandaloneScope, TxnInternal } from "@/models/structure";

export const ruleTxnOnlyEvenBlockIndex = new Map<number, boolean>();
export const ruleTxnSignatureType = new Map<number, number>();
export const ruleTxnAuthorUserType = new Map<number, number[]>();
export const ruleTxnVerify
    = new Map<
        number,
        (
            (
                txn: TxnStandalone,
                ctx: Context,
                scope: TypeTxnStandaloneScope
            ) => Promise<boolean>
        )[]
    >();
export const ruleTxnResourceReserve = new Map<number, ((txn: TxnInternal) => string)[]>();