import createContext, { Context } from "@/context";
import LazyPromise from "@/libs/LazyPromise";
import { Block } from "@/models/block";
import { TxnAny, Txn } from "@/models/transaction";

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
        inputBlock: TxnAny | Buffer
    ) {
        await this.promiseReady.get();

        let txn: TxnAny;

        if (inputBlock instanceof Buffer) {
            txn = Txn.fromBuffer(inputBlock);
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
