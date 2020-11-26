import * as secp256k1 from "@/services/crypto/ec/secp256k1";
import $$, * as $ from "@/models/structure";
import BufferWrapper from "@/libs/BufferWrapper";
import { TestBaseUser } from "./BaseUser";
import { TestDocument } from "./Document";
import { Blob, TxnStandalone } from "@/models/structure";

/******************************/

export class TestUserCommon extends TestBaseUser {
    sign(hash: Buffer, key = this.privateKey()) {
        return secp256k1.sign(
            key,
            hash
        )
    }

    txnCommon(
        transaction: TxnStandalone
    ) {
        const txn = transaction.asType($.TYPE_TXN_INSERT_DOCUMENT);

        txn.get('signingBlockHash', Blob)
            .setValue(this.node().getCurrentTopBlock().getHash());
        txn.setValue('author', this.id());

        const hash: Buffer = txn.getHash();
        txn.set('signature', $$.create('Signature')
            .setValue(this.sign(hash) as BufferWrapper)
        );

        this.node().takeTransaction(txn);

        return txn;
    }

    txnInsertDocument(
        id: number,
        body: string
    ) {
        const transaction = $$.create('TxnStandalone').asType($.TYPE_TXN_INSERT_DOCUMENT);
        const document = $$.create('Document');
        const fileHash = $$.create('Hash').setValue('type', $.TYPE_HASH_Sha256);

        document.setValue('documentId', id);
        document.setValue('countOfCredits', 1);
        document.setValue('countOfOptions', 1);
        document.setValue('distribution', $.FLAG_DOCUMENT_DISABLE_FLOW );
        document.set('documentHash', fileHash.setHashFromString(body));
        document.setValue('timeEnd', Date.now() + 1e3 * 60);

        transaction.setValue('version', 1);
        transaction.setValue('type', $.TYPE_TXN_INSERT_DOCUMENT);
        transaction.set('data', document);

        return this.txnCommon(transaction);
    }

    txnSetEndorsing(
        user: TestUserCommon
    ) {
        const transaction = $$.create('TxnStandalone').asType($.TYPE_TXN_SET_ENDORSING);

        transaction.setValue('version', 1);
        transaction.setValue('type', $.TYPE_TXN_SET_ENDORSING);
        transaction.get('data').get('userId').setValue(user.id());
        transaction.get('data').get('slotIndex').setValue(user.id());

        return this.txnCommon(transaction);
    }

    txnBind(
        user: TestUserCommon
    ) {
        const transaction = $$.create('TxnStandalone').asType($.TYPE_TXN_BIND);

        transaction.setValue('version', 1);
        transaction.setValue('type', $.TYPE_TXN_BIND);
        transaction.get('data').setValue('userId', user.id());

        return this.txnCommon(transaction);
    }

    txnVote(
        document: TestDocument
    ) {
        const transaction = $$.create('TxnStandalone').asType($.TYPE_TXN_VOTE);

        transaction.setValue('version', 1);
        transaction.setValue('type', $.TYPE_TXN_VOTE);
        transaction.get('data').setValue('documentId', document.id());
        transaction.get('data').setValue('votes', [1]);

        return this.txnCommon(transaction);
    }

    protected $userList: TestUserCommon[] = [];
    protected $documentList: TestDocument[] = [];

    userList(): TestUserCommon[];
    userList(newValue: TestUserCommon[]): this;
    userList(newValue?: TestUserCommon[]) {
        if (newValue !== undefined) {
            this.$userList = newValue;
            return this;
        }
        return this.$userList;
    }
    documentList(): TestDocument[];
    documentList(newValue: TestDocument[]): this;
    documentList(newValue?: TestDocument[]) {
        if (newValue !== undefined) {
            this.$documentList = newValue;
            return this;
        }
        return this.$documentList;
    }

    randomBehavior = async () => {
        const behavior = Math.floor(Math.random() * 100) % 5;

        // while (this.node().getCurrentTopBlock().getIndex() % 2) {
        //     await new Promise((r) => setTimeout(r, 1e2));
        // }

        switch (behavior) {
            case 0: {
                // bind
                const randomUser = this.userList()[Math.floor(Math.random() * this.userList().length)];

                if (randomUser) {
                    this.txnBind(randomUser);
                }
            } break;
            case 1: {
                // endorsing
                const randomUser = this.userList()[Math.floor(Math.random() * this.userList().length)];

                if (randomUser) {
                    this.txnSetEndorsing(randomUser);
                }
            } break;
            case 2:
            case 3:
            case 4: {
                // vote
                const randomDocument = this.documentList()[Math.floor(Math.random() * this.documentList().length)];

                if (randomDocument) {
                    this.txnVote(randomDocument);
                }
            } break;
        }

        this.requestRandomBehavior();
    }
}
