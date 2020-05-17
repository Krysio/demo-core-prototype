import { Context } from "@/context";
import { Block } from "@/models/block";

/******************************/

export default function(rawContext: unknown) {
    const context = rawContext as Context;

    return {
        async getBlockByHash(hash: Buffer) {
            const blockData = await context.store.blocks.getBlockByHash(hash);

            if (blockData !== null) {
                return Block.fromBuffer(blockData);
            }

            return null;
        },
        storeBlock(inputBlock: Block | Buffer) {
            return context.store.blocks.storeBlock(inputBlock);
        }
    };
}
