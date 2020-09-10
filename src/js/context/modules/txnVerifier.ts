import { Context } from "@/context";
import { createModule } from "@/libs/Module";
import {
    TxnStandalone,
    Uleb128, BlockHash,
    TYPE_TXN_SIGNATURE_ADMIN,
    TYPE_TXN_SIGNATURE_USER,
    TYPE_TXN_SIGNATURE_GROUP,
    User
} from "@/models/structure";
import { ruleTxnSignatureType, ruleTxnAuthorUserType } from "../rules";

/******************************/

export default function moduleTxnVerifier(ctx: unknown) {
    const context = ctx as Context;

    return createModule(async (args: {
        txn: TxnStandalone,
        author?: User,
        authors?: User[]
    }) => {
        return args;
    });
}
