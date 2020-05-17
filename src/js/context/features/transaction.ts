import { Context } from "@/context";
import { Transaction } from "@/models/transaction";
import { Block } from "@/models/block";

/******************************/

export default function (refContext: unknown) {
    const context = refContext as Context;

    return {
        waitedTransactions: {} as {[key: string]: Transaction[]},
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
                                txn.setBlockHash(null);
                                block.insertTransaction(txn.toBuffer());
                            }

                            delete context.waitedTransactions[ keyString ];
                        }
                    }
                }
            }
        }
    };
}
