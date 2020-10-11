import { Context } from "@/context";
import { createModule } from "@/libs/Module";
import Structure, {
    Uleb128,
    Document
} from "@/models/structure";

export default function moduleDocumentInsert(ctx: unknown) {
    const context = ctx as Context;

    return createModule((
        document: Document
    ) => {
        const documentId = document.getValue('documentId', Uleb128);

        context.store.document.put(documentId, document.toBuffer());

        return null;
    });
}
