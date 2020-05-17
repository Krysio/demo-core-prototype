
import createContext, { Context } from "@/context";
import LazyPromise from "@/libs/LazyPromise";
import { Block } from "@/models/block";

/******************************/

export default class Node {
    promiseReady = new LazyPromise();
    context: Context;

    constructor() {
        this.context = createContext(this);

        Promise.all([
            new Promise((r) => this.context.events.once("db/keys/ready", r))
        ]).then(() => {
            this.context.events.emit("node/ready");
            this.promiseReady.resolve();
        });
    }

    /******************************/

    async takeBlock(
        inputBlock: Block | Buffer
    ) {
        await this.promiseReady.get();

        let block;

        if (inputBlock instanceof Buffer) {
            block = Block.fromBuffer(inputBlock);
        } else {
            block = inputBlock;
        }

        this.context.events.emit("input/block", block);
    }
}
