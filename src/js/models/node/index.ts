import createContext, { Context } from "@/context";
import LazyPromise from "@/libs/LazyPromise";
import { Block } from "@/models/block";
import $$, { TxnStandalone } from "@/models/structure";
import BufferWrapper from "@/libs/BufferWrapper";

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

        let block: Block;

        if (inputBlock instanceof Buffer) {
            block = Block.fromBuffer(inputBlock);
        } else {
            block = inputBlock;
        }

        this.context.events.emit("input/block", block);
    }

    async takeTransaction(
        inputBlock: TxnStandalone | Buffer
    ) {
        await this.promiseReady.get();

        let txn: TxnStandalone;

        if (inputBlock instanceof Buffer) {
            txn = $$.create('TxnStandalone').fromBuffer(BufferWrapper.create(inputBlock).seek(0));
        } else {
            txn = inputBlock;
        }

        this.context.events.emit("input/txn", txn);
    }

    getCurrentTopBlock() {
        if (this.context.hasTopBlock() === false) {
            return null;
        }
        return this.context.getTopBlock();
    }
}
