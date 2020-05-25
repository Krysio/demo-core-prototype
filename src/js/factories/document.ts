import { Document } from '@/models/document';
import Time from '@/services/Time';

/******************************/

export function createSampleDocument(input: {
    authorId: number
}) {
    return Document.create()
        .setAuthorId(input.authorId)
        .setCountOfCredits(1)
        .setCountOfOptions(1)
        .setTimeEnd(Time.now() + 60e3);
}
