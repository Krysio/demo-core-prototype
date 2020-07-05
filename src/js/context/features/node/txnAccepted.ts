import { Context } from "@/context";
import { TxnStandalone, BlockIndex, BlockHash } from "@/models/structure";

/******************************/

export default function (rawContext: unknown) {
    const context = rawContext as Context;

    context.events.on('node/txn/verify/accept', (txn: TxnStandalone) => {
        if (txn.isAdminTransaction()) {
            const ref = context.waitedTransactionsSigningBlockIndex;
            const index = txn.getValue('signingBlockIndex', BlockIndex);

            ref[ index ] = ref[ index ] || [];
            ref[ index ].push(txn);
        }
        if (txn.isUserTransaction()) {
            const ref = context.waitedTransactionsSigningBlockHash;
            const hash = txn.getValue('signingBlockHash', BlockHash);
            const keyString = hash.toString('hex');

            ref[ keyString ] = ref[ keyString ] || [];
            ref[ keyString ].push(txn);
        }
    });
}
