import { Context } from "@/context";
import { TxnAny, TxnTypeAdmin, TxnTypeUser } from "@/models/transaction";

/******************************/

export default function (rawContext: unknown) {
    const context = rawContext as Context;

    context.events.on('node/txn/verify/accept', (txn: TxnAny) => {
        if (txn instanceof TxnTypeAdmin) {
            const ref = context.waitedTransactionsSigningBlockIndex;
            const index = txn.getSigningBlockIndex();

            ref[ index ] = ref[ index ] || [];
            ref[ index ].push(txn);
        } else if (txn instanceof TxnTypeUser) {
            const ref = context.waitedTransactionsSigningBlockHash;
            const hash = txn.getSigningBlockHash();
            const keyString = hash.toString('hex');

            ref[ keyString ] = ref[ keyString ] || [];
            ref[ keyString ].push(txn);
        }
    });
}
