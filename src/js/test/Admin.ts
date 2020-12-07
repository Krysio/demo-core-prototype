import { TestAdminCommon } from "./AdminCommon";
import { getUniqueUserId } from ".";
import { createAdmin } from "@/factories/txn";
import { Block } from "@/models/block";
import Time from "@/services/Time";

/******************************/

export class TestAdmin extends TestAdminCommon {
    protected $level = 1;

    level(): number;
    level(newValue: number): this;
    level(newValue?: number) {
        if (newValue !== undefined) {
            this.$level = newValue;
            return this;
        }
        return this.$level;
    }

    createAdmin(
        level: number
    ) {
        const admin = new TestAdmin(this.node());
        admin.id(getUniqueUserId());
        admin.level(level);
        return admin;
    }
    insertAdmin(
        admin: TestAdmin,
        signingBlock: Block
    ) {
        const txn = createAdmin({
            userId: admin.id(),
            timeStart: Date.now() + 1e3,
            level: admin.level(),
            targetBlockIndex: signingBlock.getIndex(),
            publicKey: admin.publicKey(),
            parentId: 0,
            parentPrivateKey: this.privateKey()
        });

        this.node().takeTransaction(txn.transaction);
    }
}