import { Context } from "@/context";
import { createModule } from "@/libs/Module";
import BufferWrapper from "@/libs/BufferWrapper";
import { Block } from "@/models/block";
import Structure, { User, Uleb128 } from "@/models/structure";
import { ruleTxnResourceReserve } from "@/context/rules";

/******************************/

const emptyBuffer = BufferWrapper.alloc(0);

/******************************/

export default function moduleBlockBuilder(ctx: unknown) {
    const context = ctx as Context;

    return createModule((args: {
        index: number,
        time: number,
        previousBlockHash: BufferWrapper,
        secondPreviousBlockHash: BufferWrapper,
    }) => {
        const { index, previousBlockHash, secondPreviousBlockHash } = args;
        const block = Block.create() as Block;
        const reservedResources = [] as string[];

        block.setIndex(index);
        block.setTime(args.time);
        block.setPreviousBlockHash(args.previousBlockHash);

        // wstawianie transakcji
        const txnByIndex = context.module.txnCollector.api.getTxnForBlockByIndex(index - 1, false);
        const txnByHash = context.module.txnCollector.api.getTxnForBlockByHash(previousBlockHash.toString('hex'), false);
        const txnList = [...txnByIndex, ...txnByHash];

        if (txnList.length > 1) {
            txnList.sort(BufferWrapper.compare);

            for (let i = 0; i < txnList.length; i++) {
                let txnBuffer = txnList[i]; txnBuffer.cursor = 0;
                let flag = true;
                const txn = Structure.create('TxnInternal').fromBuffer(txnBuffer);
                const type = txn.getValue('type', Uleb128);
                const ruleResourceReserve = ruleTxnResourceReserve.get(type);

                // zajmowanie zasobów, np userId, kto pierwszy ten lepszy
                if (ruleResourceReserve) {
                    const resourcesToReserve = ruleResourceReserve.map(F => F(txn));

                    for (let resource of resourcesToReserve) {
                        if (reservedResources.indexOf(resource) !== -1) {
                            flag = false;
                        }
                        reservedResources.push(resource);
                    }
                }

                if (flag) {
                    block.insertTransaction(txnBuffer);
                }
            }
        } else if (txnList.length) {
            block.insertTransaction(txnList[0]);
        }

        // TODO policzyć wartość

        return block;
    });
}
