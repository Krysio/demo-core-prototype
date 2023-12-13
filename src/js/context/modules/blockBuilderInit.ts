import { Context } from "@/context";
import { createModule } from "@/libs/Module";

export default function moduleBlockBuilderInit(ctx: unknown) {
    const context = ctx as Context;

    return createModule(() => {
        const config = context.getConfig();
        const currentTopBlock = context.getTopBlock();

        const result = {
            index: currentTopBlock.getIndex() + 1,
            time: currentTopBlock.getTime() + config.getDiscreteBlockPeriod(),
            previousBlockHash: currentTopBlock.getHash(),
            secondPreviousBlockHash: currentTopBlock.getPreviousBlockHash()
        };

        return result;
    });
}
