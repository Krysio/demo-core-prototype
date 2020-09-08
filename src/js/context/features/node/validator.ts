import { Context } from "@/context";
import BufferWrapper from "@/libs/BufferWrapper";
import { TxnStandalone } from "@/models/structure";

/******************************/

export default function (rawContext: unknown) {
    const context = rawContext as Context;

    context.events.on(
        'node/parser/txn/out',
        (value) => context.events.emit('node/validator/txn/in', value)
    );

    context.events.on('node/validator/txn/in', async (
        txn: TxnStandalone
    ) => {
        // Node nie działa
        if (context.hasTopBlock() === false
            || context.hasConfig() === false
        ) {
            return;
        }

        // poprawność struktór 
        if (!txn.isValid()) {
            return;
        }

        const version = txn.getValue('version');
        
        
    });
}