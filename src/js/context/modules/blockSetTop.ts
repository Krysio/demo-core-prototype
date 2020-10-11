import { Context } from "@/context";
import { createModule } from "@/libs/Module";
import { Block } from "@/models/block";
import Structure from "@/models/structure";
import { ruleTxnApply } from "@/context/rules";

export default function moduleBlockSetTop(ctx: unknown) {
    const context = ctx as Context;

    return createModule((
        block: Block
    ) => {
        context.pushTopBlock(block);

        const body = block.getBody();
        const txnCount = block.getCountOfTransactions();

        for (let i = 0; i < txnCount; i++) {
            const txn = Structure.create('TxnInternal').fromBuffer(body);
            const type = txn.getValue('type');

            // czytanie każdej transakcji

            const apply = ruleTxnApply.get(type);
            if (apply) {
                apply.call(txn, context);
            }
        }

        // TODO REMOVE
        context.events.emit('node/topBlock/changed', block);
    });
}
