import { Context } from "@/context";
import createKeyStore from "./key";
import createBlockStore from "./block";

/******************************/

export default function(rawContext: unknown) {
    const context = rawContext as Context;
    const keyStore = createKeyStore();
    const blockStore = createBlockStore();

    setTimeout(() => {
        context.events.emit("db/keys/ready");
    });

    return {
        keys: keyStore,
        blocks: blockStore
    };
}
