import Node from "@/models/node";
import $$, * as $ from "@/models/structure";
import * as secp256k1 from "@/services/crypto/ec/secp256k1";
import { Blob, Uleb128 } from "@/models/structure";
import BufferWrapper from "@/libs/BufferWrapper";

export class TestDocument {
    protected $id: number = -1;
    protected $body: string = '';
    protected $timeStart: number = -1;
    protected $timeEnd: number = -1;

    constructor(
        protected $node: Node
    ) {}

    id(): number;
    id(newValue: number): this;
    id(newValue?: number) {
        if (newValue !== undefined) {
            this.$id = newValue;
            return this;
        }
        return this.$id;
    }

    body(): string;
    body(newValue: string): this;
    body(newValue?: string) {
        if (newValue !== undefined) {
            this.$body = newValue;
            return this;
        }
        return this.$body;
    }

    timeStart(): number;
    timeStart(newValue: number): this;
    timeStart(newValue?: number) {
        if (newValue !== undefined) {
            this.$timeStart = newValue;
            return this;
        }
        return this.$timeStart;
    }

    timeEnd(): number;
    timeEnd(newValue: number): this;
    timeEnd(newValue?: number) {
        if (newValue !== undefined) {
            this.$timeEnd = newValue;
            return this;
        }
        return this.$timeEnd;
    }

    node(): Node;
    node(newValue: Node): this;
    node(newValue?: Node) {
        if (newValue !== undefined) {
            this.$node = newValue;
            return this;
        }
        return this.$node;
    }

    txnInsert(input: {
        authorId: number,
        privateKey: Buffer,
        type: 'user' | 'admin'
    }) {
        const transaction = $$.create('TxnStandalone').asType($.TYPE_TXN_INSERT_DOCUMENT);
        const document = $$.create('Document');
        const fileHash = $$.create('Hash').setValue('type', $.TYPE_HASH_Sha256);

        document.setValue('documentId', this.id());
        document.setValue('timeEnd', this.timeEnd());
        document.setValue('timeStart', this.timeStart());
        document.set('documentHash', fileHash.setHashFromString(this.body()));
        document.setValue('countOfCredits', 1);
        document.setValue('countOfOptions', 1);
        document.get('distribution').setValue($.FLAG_DOCUMENT_DISABLE_FLOW);

        transaction.setValue('version', 1);
        if (input.type === 'user') {
            transaction.setValue('type', $.TYPE_TXN_INSERT_DOCUMENT);
            transaction
                .get('signingBlockHash', Blob)
                .setValue(this.node().getCurrentTopBlock().getHash());
        } else {
            transaction.setValue('type', $.TYPE_TXN_INSERT_DOCUMENT_BY_ADMIN);
            transaction
                .get('signingBlockIndex', Uleb128)
                .setValue(this.node().getCurrentTopBlock().getIndex());
        }
        transaction.set('data', document);
        transaction.setValue('author', input.authorId);

        const hash: Buffer = transaction.getHash();
        transaction.set('signature', $$.create('Signature')
            .setValue(secp256k1.sign(
                input.privateKey,
                hash
            ) as BufferWrapper)
        );

        this.node().takeTransaction(transaction);

        return transaction;
    }
}