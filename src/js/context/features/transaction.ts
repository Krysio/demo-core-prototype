import { Context } from "@/context";
import { TxnAny } from "@/models/transaction";
import { Block } from "@/models/block";

/******************************/

export default function (refContext: unknown) {
    const context = refContext as Context;

    return {
        waitedTransactionsSigningBlockHash: {} as {[key: string]: TxnAny[]},
        waitedTransactionsSigningBlockIndex: {} as {[key: number]: TxnAny[]},
        async insertWaitingTransactionsToBlock(
            block: Block
        ) {
            const index = block.getIndex() - 2;
            const ref = context.waitedTransactionsSigningBlockIndex[ index ];
            if (ref) {
                for (let txn of ref) {
                    block.insertTransaction(txn.toBuffer(true));
                }

                delete context.waitedTransactionsSigningBlockIndex[ index ];
            }

            const previousBlockHash = block.getPreviousBlockHash();

            if (previousBlockHash !== null) {
                const previousBlock = await context.getBlockByHash(
                        previousBlockHash
                    );

                if (previousBlock !== null) {
                    const key = previousBlock.getPreviousBlockHash();

                    if (key !== null) {
                        const keyString = key.toString('hex');
                        const ref = context.waitedTransactionsSigningBlockHash[ keyString ];
                        if (ref) {
                            for (let txn of ref) {
                                block.insertTransaction(txn.toBuffer(true));
                            }

                            delete context.waitedTransactionsSigningBlockHash[ keyString ];
                        }
                    }
                }
            }
        }
    };
}
