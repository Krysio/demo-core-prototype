import { Context } from "@/context";
import Structure, { TxnStandalone } from "@/models/structure";
import { Block } from "@/models/block";

/******************************/

export default function (refContext: unknown) {
    const context = refContext as Context;

    return {
        waitedTransactionsSigningBlockHash: {} as { [key: string]: TxnStandalone[] },
        waitedTransactionsSigningBlockIndex: {} as { [key: number]: TxnStandalone[] },
        async insertWaitingTransactionsToBlock(
            block: Block
        ) {
            const index = block.getIndex() - 2;
            const ref = context.waitedTransactionsSigningBlockIndex[index];

            if (ref) {
                for (let txn of ref) {
                    const txnBuffer = Structure
                        .create('TxnInternal')
                        .fromStructure(txn)
                        .toBuffer();

                    block.insertTransaction(txnBuffer);
                }

                delete context.waitedTransactionsSigningBlockIndex[index];
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
                        const ref = context.waitedTransactionsSigningBlockHash[keyString];

                        if (ref) {
                            for (let txn of ref) {
                                block.insertTransaction(
                                    Structure
                                    .create('TxnInternal')
                                    .fromStructure(txn)
                                    .toBuffer()
                                );
                            }

                            delete context.waitedTransactionsSigningBlockHash[keyString];
                        }
                    }
                }
            }
        }
    };
}
