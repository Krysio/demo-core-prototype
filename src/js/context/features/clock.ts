import { Context } from "@/context";
import LazyPromise from "@/libs/LazyPromise";
import { Block } from "@/models/block";

/******************************/

export default function (refContext: unknown) {
    const context = refContext as Context;
    const syncPromise = new LazyPromise();
    let syncLock = false;

    // umieszcza kandydata na szczycie łańcucha
    function pushBlockChain() {
        if (context.hasConfig()) {
            const config = context.getConfig();
            const currentTopBlock = context.getTopBlock();
            let nextBlock = context.getTopBlockCandidate();

            if (nextBlock === null) {
                nextBlock = Block.create() as Block;
                nextBlock.setIndex(currentTopBlock.getIndex() + 1);
                nextBlock.setPreviousBlockHash(currentTopBlock.getHash());
            }

            nextBlock.setTime(currentTopBlock.getTime() + config.getDiscreteBlockPeriod());
            context.insertWaitingTransactionsToBlock(nextBlock);

            context.topBlock.current = nextBlock;
            context.storeBlock(nextBlock);

            const nextCandidate = Block.create();

            nextCandidate.setIndex(nextBlock.getIndex() + 1);
            nextCandidate.setPreviousBlockHash(nextBlock.getHash());
            context.insertWaitingTransactionsToBlock(nextCandidate);

            context.topBlock.candidate = nextCandidate;

            setTimeout(afterPushBlockChain);
        }
    }
    function afterPushBlockChain() {
        tick();
        context.events.emit('node/topBlock/push', context.getTopBlock());
        context.events.emit('node/topBlock/changed', context.getTopBlock());
    }

    // sprzwdza czy nie jesteśmy w tyle z wytworzeniem bloku
    function tick() {
        if (context.hasTopBlock() === true) {
            const currentTopBlock = context.getTopBlock();
            const currentIndex = context.getCurrentBlockIndex();

            if (currentIndex > currentTopBlock.getIndex()) {
                syncPromise.reset();
                syncLock = true;
                setTimeout(pushBlockChain);
            } else if (syncLock === true) {
                syncLock = false;
                syncPromise.resolve();
            }
        }
    }

    /******************************/

    let intervalId: unknown;
    context.events.on('init', () => {
        intervalId = setInterval(tick, 300) as unknown;
    });
    context.events.on('destroy/before', () => {
        //@ts-ignore
        clearInterval(intervalId);
    });
    context.events.once('node/topBlock/changed', () => {
        syncLock = false;
        syncPromise.resolve();
    });

    /******************************/

    return {
        sync() {
            tick();
            return syncPromise.get();
        }
    };
}
