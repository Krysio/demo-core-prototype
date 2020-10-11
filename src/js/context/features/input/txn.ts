import { Context } from "@/context";
import { TxnStandalone, BlockIndex, BlockHash } from "@/models/structure";
import Time from "@/services/Time";
import BufferWrapper from "@/libs/BufferWrapper";

/******************************/

export default function (rawContext: unknown) {
    const context = rawContext as Context;

    context.events.on('input/txn', async (txn: TxnStandalone) => {
        context.module.txnParser.in(txn.toBuffer());
    });
}