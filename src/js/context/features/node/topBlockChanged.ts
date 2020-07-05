import { Context } from "@/context";
import { Block } from "@/models/block";
import Structure from "@/models/structure";

/******************************/

export default function (rawContext: unknown) {
    const context = rawContext as Context;

    context.events.on('node/topBlock/changed', (block: Block) => {
        const body = block.getBody();
        const txnCount = block.getCountOfTransactions();

        for (let i = 0; i < txnCount; i++) {
            const txn = Structure.create('TxnInternal').fromBuffer(body);

            // czytanie każdej transakcji
            txn.apply(context);
        }
    });
}