import { Context } from "@/context";
import { createModule } from "@/libs/Module";

/******************************/

export default function moduleClock(ctx: unknown) {
    const context = ctx as Context;
    
    let tickHasBeenRequested = false;
    function requestTick() {
        if (tickHasBeenRequested === false) {
            tickHasBeenRequested = true;
            setTimeout(tick, 0);
        }
    }

    const module = createModule(requestTick);
    let prevResult = -1;

    function tick() {
        tickHasBeenRequested = false;
        if (context.hasTopBlock() === true) {
            const currentTopBlock = context.getTopBlock();
            const currentIndex = context.getCurrentBlockIndexByTime();

            if (currentIndex > currentTopBlock.getIndex()) {
                if (prevResult !== currentIndex) {
                    prevResult++;
                    module.emit(prevResult);
                }
            }
        }
    }

    setInterval(requestTick, 1);

    return module;
}
