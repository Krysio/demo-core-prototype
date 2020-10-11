import { Context } from "@/context";
import createUserStore from "./user";
import createDocumentStore from "./document";
import createBlockStore from "./block";

/******************************/

export default function(rawContext: unknown) {
    const context = rawContext as Context;
    const userStore = createUserStore();
    const documentStore = createDocumentStore();
    const blockStore = createBlockStore();

    setTimeout(() => {
        context.events.emit("db/keys/ready");
    });

    return {
        user: userStore,
        document: documentStore,
        blocks: blockStore,
    };
}
