import { Context } from "@/context";
import { Block } from "@/models/block";

/******************************/

export default function (rawContext: unknown) {
    const context = rawContext as Context;

    context.events.on("input/block", (block: Block) => {
        if (block.verify()) {
            if (context.hasTopBlock() === false) {
                context.module.blockSetTop.in(block);
            }

            context.events.emit('node/block/verify/accept', block);
        } else {
            context.events.emit('node/block/verify/reject', block);
        }
    });
}
