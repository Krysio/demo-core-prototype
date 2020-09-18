import { Context } from "@/context";
import { createModule } from "@/libs/Module";
import BufferWrapper from "@/libs/BufferWrapper";
import Structure, { User, Uleb128 } from "@/models/structure";
import { Block } from "@/models/block";

/******************************/

const emptyBuffer = BufferWrapper.alloc(0);

/******************************/

export default function moduleBlockCreator(ctx: unknown) {
    const context = ctx as Context;

    return createModule((args: {
        index: number,
        time: number,
        previousBlockHash: BufferWrapper,
        secondPreviousBlockHash: BufferWrapper,
    }) => {
        const { index, previousBlockHash, secondPreviousBlockHash } = args;
        const block = Block.create() as Block;

        block.setIndex(index);
        block.setTime(args.time);
        block.setPreviousBlockHash(args.previousBlockHash);
        
        // wstawianie transakcji
        const txnByIndex = context.module.txnCollector.api.getTxnForBlockByIndex(index - 1, false);
        const txnByIndexPrevious = context.module.txnCollector.api.getTxnForBlockByIndex(index - 2, true);
        const txnByHash = context.module.txnCollector.api.getTxnForBlockByHash(previousBlockHash.toString('hex'), false);
        const txnByHashPrevious = context.module.txnCollector.api.getTxnForBlockByHash(secondPreviousBlockHash.toString('hex'), true);
        const txnList = [
            ...txnByIndex, ...txnByIndexPrevious,
            ...txnByHash, ...txnByHashPrevious
        ];

        if (txnList.length > 1) {
            txnList.sort(BufferWrapper.compare);

            for (let i = 0; i < txnList.length; i++) {
                let txnBuffer = txnList[i]; txnBuffer.cursor = 0;
                block.insertTransaction(txnBuffer);
            }
        }

        // TODO policzyć wartość

        return block;
    });
}
