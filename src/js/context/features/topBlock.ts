import { Context } from "@/context";
import { Block } from "@/models/block";

/******************************/

export default function(rawContext: unknown) {
    const context = rawContext as Context;

    return {
        topBlock: {
            current: null as Block | null,
            candidate: null as Block | null,
        },
        hasTopBlock() {return context.topBlock.current !== null;},
        getTopBlock() {return context.topBlock.current as Block;},
        hasTopBlockCandidate() {return context.topBlock.candidate !== null;},
        getTopBlockCandidate() {return context.topBlock.candidate as Block;}
    };
}
