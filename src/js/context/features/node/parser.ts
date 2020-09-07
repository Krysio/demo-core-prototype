import { Context } from "@/context";
import BufferWrapper from "@/libs/BufferWrapper";
import $$ from "@/models/structure";

/******************************/

export default function (rawContext: unknown) {
    const context = rawContext as Context;

    context.events.on('node/parser/txn/in', async (
        bufferData: BufferWrapper
    ) => {
        const txn = $$.create('TxnStandalone').fromBuffer(bufferData);

        context.events.emit('node/parser/txn/out', txn);
    });
}