import { Context } from "@/context";
import { Block } from "@/models/block";
import { TxnInternal } from "@/models/structure/Transaction";

/******************************/

export default function (rawContext: unknown) {
    const context = rawContext as Context;

    context.events.on('node/topBlock/changed', (block: Block) => {
        const body = block.getBody();
        const txnCount = block.getCountOfTransactions();

        for (let i = 0; i < txnCount; i++) {
            const txn = TxnInternal.create(body) as TxnInternal;

            // czytanie każdej transakcji
            txn.apply(context);
        }
    });
}