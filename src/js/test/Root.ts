import { TestAdminCommon } from "./AdminCommon";
import { getUniqueUserId, getUniqueDocumentId } from ".";
import { createAdmin } from "@/factories/txn";
import { TestAdmin } from "./Admin";
import { TestDocument } from "./Document";
import * as UUID from "uuid";

/******************************/

export class TestRoot extends TestAdminCommon {
    createAdmin(
        level: number
    ) {
        const admin = new TestAdmin(this.node());
        admin.id(getUniqueUserId());
        admin.level(level);
        return admin;
    }
    insertAdmin(
        admin: TestAdmin
    ) {
        const txn = createAdmin({
            userId: admin.id(),
            level: admin.level(),
            targetBlockIndex: this.node().getCurrentTopBlock().getIndex(),
            publicKey: admin.publicKey(),
            parentId: 0,
            parentPrivateKey: this.privateKey()
        });

        this.node().takeTransaction(txn.transaction);
    }

    protected $documentList: TestDocument[] = [];
    documentList(): TestDocument[];
    documentList(newValue: TestDocument[]): this;
    documentList(newValue?: TestDocument[]) {
        if (newValue !== undefined) {
            this.$documentList = newValue;
            return this;
        }
        return this.$documentList;
    }

    protected randomBehaviorsTimeRange = 5e3;
    randomBehavior = async () => {
        const behavior = Math.floor(Math.random() * 100) % 3;

        while (this.node().getCurrentTopBlock().getIndex() % 2) {
            await new Promise((r) => setTimeout(r, 1e2));
        }

        switch (behavior) {
            case 0:
            case 1: {
                const uuid = UUID.v4();
                const now = Date.now();
                const timeEnd = now + 1e3 * 60 * 2;
                const document = new TestDocument(this.node());

                document.id(getUniqueDocumentId());
                document.body(uuid);
                document.timeEnd(timeEnd);
                document.txnInsert({
                    authorId: this.id(),
                    privateKey: this.privateKey(),
                    type: 'admin'
                });

                await new Promise((r) => setTimeout(r, 1e3));
                this.documentList().push(document);
                setTimeout(() => {
                    const index = this.documentList().indexOf(document);
                    if (index !== -1) {
                        this.documentList().splice(index, 1);
                    }
                }, timeEnd - now);
            } break;
            case 2: {

            } break;
        }

        this.requestRandomBehavior();
    }
}