import { Context } from "@/context";
import { Block } from "@/models/block";
import { Transaction } from "@/models/transaction";

/******************************/

export default function (rawContext: unknown) {
    const context = rawContext as Context;

    context.events.on('node/topBlock/changed', (block: Block) => {
        // czytanie bloku
        for (let txnBuffer of block.getBody()) {
            const txn = Transaction.fromBuffer(txnBuffer);
            // czytanie każdej transakcji
            txn.read({ context });
        }
    });
}