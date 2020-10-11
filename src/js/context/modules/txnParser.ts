import { Context } from "@/context";
import { createModule } from "@/libs/Module";
import BufferWrapper from "@/libs/BufferWrapper";
import Structure from "@/models/structure";

export default function moduleTxnParser(ctx: unknown) {
    const context = ctx as Context;

    return createModule((
        txnBuffer: BufferWrapper
    ) => {
        if (context.hasTopBlock() === false
            || context.hasConfig() === false
        ) {
            context.events.emit('node/txn/verify/reject', txn, 0);
            return;
        }
        // TODO czy node jest zsynchronizowany
        txnBuffer.cursor = 0;
        return Structure.create("TxnStandalone").fromBuffer(txnBuffer);
    });
}
