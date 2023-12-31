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
        thirdBlockHash: emptyBuffer,
        topBlock: null as Block | null,
        secondBlock: null as Block | null,
        thirdBlock: null as Block | null
    };

    const api = {
        state,
        canRun() {
            return context.hasConfig() && context.hasTopBlock();
        },
        hasTopBlock() {return context.state.topBlock !== null;},
        getTopBlock() {return context.state.topBlock as Block;},
        hasSecondTopBlock() {return context.state.secondBlock !== null;},
        getSecondTopBlock() {return context.state.secondBlock as Block;},
        getCurrentBlockIndexByTime() {
            if (context.hasConfig()) {
                const config = context.getConfig();
                const now = Time.now();
                return Math.floor((now - config.getGenesisTime()) / config.getDiscreteBlockPeriod());
            }
            return 0;
        },
        pushTopBlock(
            block: Block,
        ) {
            state.thirdBlock = state.secondBlock;
            state.secondBlock = state.topBlock;
            state.topBlock = block;
            state.thirdBlockIndex = state.secondBlockIndex;
            state.secondBlockIndex = state.topBlockIndex;
            state.topBlockIndex = block.getIndex();
            state.thirdBlockHash = state.secondBlockHash;
            state.secondBlockHash = state.topBlockHash;
            state.topBlockHash = block.getHash();
        }
    };

    return api;
}