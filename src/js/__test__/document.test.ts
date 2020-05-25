import { Document } from '../models/document';

/******************************/

it('document', () => {
    const document1 = Document.create()
        .setAuthorId(1)
        .setCountOfCredits(1)
        .setCountOfOptions(1)
        .setTimeEnd(Date.now() + 60e3);

    const buff1 = document1.toBuffer();
    const document2 = Document.fromBuffer(buff1);
    const buff2 = document2.toBuffer();

    expect(Buffer.compare(
        buff1,
        buff2
    )).toBe(0);
});
