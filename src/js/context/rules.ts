import { Context } from "@/context";
import { TxnStandalone } from "@/models/structure";

export const ruleTxnAuthorUserType = new Map<number, number[]>();
export const ruleTxnVerify = new Map<number, ((txn: TxnStandalone, ctx: Context, scope: {[key: string]: any}) => Promise<boolean>)[]>();
