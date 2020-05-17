import { Context } from "@/context";
import { Txn, TxnAny } from "@/models/transaction";
import { Block } from "@/models/block";

/******************************/

export default function (refContext: unknown) {
    const context = refContext as Context;

    return {
        waitedTransactions: {} as {[key: string]: TxnAny[]},
        async insertWaitingTransactionsToBlock(
            block: Block
        ) {
            const previousBlockHash = block.getPreviousBlockHash();

            if (previousBlockHash !== null) {
                const previousBlock = await context.getBlockByHash(
                        previousBlockHash
                    );

                if (previousBlock !== null) {
                    const key = previousBlock.getPreviousBlockHash();

                    if (key !== null) {
                        const keyString = key.toString('hex');
                        const ref = context.waitedTransactions[ keyString ];

                        if (ref) {
                            for (let txn of ref) {
                                block.insertTransaction(txn.toBuffer(true));
                            }

                            delete context.waitedTransactions[ keyString ];
                        }
                    }
                }
            }
        }
    };
}
