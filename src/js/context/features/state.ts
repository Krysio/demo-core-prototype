import { Context } from "@/context";
import Time from "@/services/Time";
import { Block } from "@/models/block";
import BufferWrapper from "@/libs/BufferWrapper";

/******************************/

const emptyBuffer = BufferWrapper.alloc(0);

/******************************/

export default function(rawContext: unknown) {
    const context = rawContext as Context;
    const state = {
        topBlockIndex: -1,
        secondBlockIndex: -2,
        thirdBlockIndex: -3,
        topBlockHash: emptyBuffer,
        secondBlockHash: emptyBuffer,
        thirdBlockHash: emptyBuffer
    };

    return {
        state,
        canRun() {
            return context.hasConfig() && context.hasTopBlock();
        },
        getCurrentBlockIndexByTime() {
            if (context.hasConfig()) {
                const config = context.getConfig();
                const now = Time.now();
                return Math.floor((now - config.getGenesisTime()) / config.getDiscreteBlockPeriod());
            }
            return 0;
        },
        pushBlockIndexAndHash(
            index: number,
            blockHash: BufferWrapper
        ) {
            state.thirdBlockIndex = state.secondBlockIndex;
            state.secondBlockIndex = state.topBlockIndex;
            state.topBlockIndex = index;
            state.thirdBlockHash = state.secondBlockHash;
            state.secondBlockHash = state.topBlockHash;
            state.topBlockHash = blockHash;
        }
    };
}