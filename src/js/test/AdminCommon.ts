import { TestBaseUser } from "./BaseUser";
import { getUniqueUserId } from ".";
import { createUser, removeUser, createPublicUser } from "@/factories/txn";
import { TestUser } from "./User";
import { TestPublicUser } from "./PublicUser";

/******************************/

export class TestAdminCommon extends TestBaseUser {
    createUser() {
        const user = new TestUser(this.node());
        user.id(getUniqueUserId());
        return user;
    }
    insertUser(
        user: TestUser
    ) {
        const txn = createUser({
            userId: user.id(),
            targetBlockIndex: this.node().getCurrentTopBlock().getIndex(),
            publicKey: user.publicKey(),
            parentId: this.id(),
            level: 0,
            parentPrivateKey: this.privateKey(),
            timeEnd: Date.now() + 1e3 * 60 * 5,
            timeStart: Date.now() + 4e3
        });

        this.node().takeTransaction(txn.transaction);
    }
    removeUser(
        user: TestUser
    ) {
        const txn = removeUser({
            userId: user.id(),
            parentId: this.id(),
            parentPrivateKey: this.privateKey(),
            targetBlockIndex: this.node().getCurrentTopBlock().getIndex()
        })

        this.node().takeTransaction(txn.transaction);
    }
    createPublicUser() {
        const user = new TestPublicUser(this.node());
        user.id(getUniqueUserId());
        return user;
    }
    insertPublicUser(
        user: TestPublicUser
    ) {
        const txn = createPublicUser({
            userId: user.id(),
            targetBlockIndex: this.node().getCurrentTopBlock().getIndex(),
            publicKey: user.publicKey(),
            parentId: this.id(),
            parentPrivateKey: this.privateKey(),
            timeEnd: Date.now() + 1e3 * 60 * 5,
            timeStart: Date.now() + 4e3
        });

        this.node().takeTransaction(txn.transaction);
    }
}