import { Context } from "@/context";
import createUserStore from "./user";
import createDocumentStore from "./document";
import createBlockStore from "./block";
import createDocumentAssociacionStore from "./docassoc";

/******************************/

export default function(rawContext: unknown) {
    const context = rawContext as Context;
    const userStore = createUserStore();
    const documentStore = createDocumentStore();
    const blockStore = createBlockStore();
    const associacionStore = createDocumentAssociacionStore();

    setTimeout(() => {
        context.events.emit("db/keys/ready");
    });

    return {
        user: userStore,
        document: documentStore,
        blocks: blockStore,
        associacion: associacionStore
    };
}
