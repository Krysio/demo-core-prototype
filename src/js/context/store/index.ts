import { Context } from "@/context";
import createUserStore from "./user";
import createBlockStore from "./block";

/******************************/

export default function(rawContext: unknown) {
    const context = rawContext as Context;
    const userStore = createUserStore();
    const blockStore = createBlockStore();

    setTimeout(() => {
        context.events.emit("db/keys/ready");
    });

    return {
        user: userStore,
        blocks: blockStore
    };
}
