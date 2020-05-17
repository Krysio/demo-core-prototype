import { Context } from "@/context";
import { Block } from "@/models/block";

/******************************/

export default function (rawContext: unknown) {
    const context = rawContext as Context;

    context.events.on('node/block/verify/accept', (block: Block) => {
        // chomikujemy blok,
        // jeśli blok jest atrakcyjniejszy to trzeba wymienić
        // czyli sprawdzamy czy mamy pełny łańcuch w górę, jak nie uzupełniamy

        // raczej będziemy rozpatrywać tylko topowy blok
        // gdy jest to nie topowy blok nie rozpatrujemy

        context.storeBlock(block);

        const currentIndex = context.getCurrentBlockIndex();

        if (context.hasTopBlock() === false
            && currentIndex === block.getIndex()
        ) {
            context.events.emit('node/topBlock/compare', block);
        }
    });
}
