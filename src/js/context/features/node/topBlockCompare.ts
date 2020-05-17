import { Context } from "@/context";
import { Block } from "@/models/block";

/******************************/

export default function(rawContext: unknown) {
    const context = rawContext as Context;

    function changeBlock(block: Block) {
        context.topBlock.current = block;
        context.events.emit('node/topBlock/compare/accept', block);
        context.events.emit('node/topBlock/changed', block);
    }

    context.events.on('node/topBlock/compare', (block: Block) => {
        // nie mamy aktualnie bloku na szczycie = genesis, więc przyjmujemy
        if (context.hasTopBlock() === false) {
            changeBlock(block);
            return;
        }

        const topBlock = context.getTopBlock();

        // blok nie jest następnikiem tego co obecny blok na szycie
        if (Buffer.compare(
                topBlock.getPreviousBlockHash() as Buffer,
                block.getPreviousBlockHash() as Buffer
            ) !== 0
        ) {
            context.events.emit('node/topBlock/compare/reject', block);
            return;
        }

        // zliczenie wartości
        // TODO
        if (false) {
            changeBlock(block);
            return;
        } else {
            context.events.emit('node/topBlock/compare/reject', block);
            return;
        }
    });
}