import * as secp256k1 from "@/services/crypto/ec/secp256k1";
import $$, * as $ from "@/models/structure";
import BufferWrapper from "@/libs/BufferWrapper";
import Node from "@/models/node";

/******************************/

export class TestUser {
    private $publicKey: Buffer;
    private $privateKey: Buffer;
    private $id: number = -1;

    constructor(
        private $node: Node
    ) {
        const [ privateKey, publicKey ] = secp256k1.getKeys();

        this.$publicKey = publicKey;
        this.$privateKey = privateKey;
    }

    /******************************/

    node(): Node;
    node(newValue: Node): this;
    node(newValue?: Node) {
        if (newValue !== undefined) {
            this.$node = newValue;
            return this;
        }
        return this.$node;
    }

    id(): number;
    id(newValue: number): this;
    id(newValue?: number) {
        if (newValue !== undefined) {
            this.$id = newValue;
            return this;
        }
        return this.$id;
    }

    privateKey(): Buffer;
    privateKey(newValue: Buffer): this;
    privateKey(newValue?: Buffer) {
        if (newValue !== undefined) {
            this.$privateKey = newValue;
            return this;
        }
        return this.$privateKey;
    }

    publicKey(): Buffer;
    publicKey(newValue: Buffer): this;
    publicKey(newValue?: Buffer) {
        if (newValue !== undefined) {
            this.$publicKey = newValue;
            return this;
        }
        return this.$publicKey;
    }

    /******************************/

    txnInsertDocument(
        body: string
    ) {
        const transaction = $$.create('TxnStandalone').asType($.TYPE_TXN_INSERT_DOCUMENT);
        const document = $$.create('Document');
        const fileHash = $$.create('Hash').setValue('type', $.TYPE_HASH_Sha256);

        document.setValue('authorId', this.id());
        document.setValue('countOfCredits', 1);
        document.setValue('countOfOptions', 1);
        document.setValue('distribution', $.FLAG_DOCUMENT_DISABLE_FLOW );
        document.setValue('fileType', $.FILE_FORMAT_TXT);
        document.set('fileHash', fileHash.setHashFromString(body));
        document.setValue('timeEnd', Date.now() + 1e3 * 60);

        transaction.setValue('version', 1);
        transaction.setValue('type', $.TYPE_TXN_INSERT_DOCUMENT);
        transaction.set('data', document);
        transaction.setValue('signingBlockHash', this.$node.getCurrentTopBlock().getHash());
        transaction.setValue('author', this.id());

        const hash: Buffer = transaction.getHash();
        transaction.set('signature', $$.create('Signature')
            .setValue(secp256k1.sign(
                this.privateKey(),
                hash
            ) as BufferWrapper)
        );

        this.$node.takeTransaction(transaction);

        return transaction;
    }

    txnInsertEdorsing(
        user: TestUser
    ) {
        const transaction = $$.create('TxnStandalone').asType($.TYPE_TXN_INSERT_ENDORSING);

        transaction.setValue('version', 1);
        transaction.setValue('type', $.TYPE_TXN_INSERT_DOCUMENT);
        transaction.get('data').setValue('userId', user.id());
        transaction.setValue('signingBlockHash', this.$node.getCurrentTopBlock().getHash());
        transaction.setValue('author', this.id());

        const hash: Buffer = transaction.getHash();
        transaction.set('signature', $$.create('Signature')
            .setValue(secp256k1.sign(
                this.privateKey(),
                hash
            ) as BufferWrapper)
        );

        this.$node.takeTransaction(transaction);

        return transaction;
    }
}