import * as secp256k1 from "@/services/crypto/ec/secp256k1";
import $$, * as $ from "@/models/structure";
import BufferWrapper from "@/libs/BufferWrapper";
import { TestUserCommon } from "./UserCommon";
import Node from "@/models/node";
import { getUniqueUserId } from ".";

/******************************/

export class TestUser extends TestUserCommon {
    protected $identityList = [] as {
        id: number,
        level: number,
        timeEnd: number,
        privateKey: Buffer,
        publicKey: Buffer
    }[];

    constructor(
        protected $node: Node
    ) {
        super($node);

        const [ privateKey, publicKey ] = secp256k1.getKeys();

        this.$identityList.push({
            id: 0,
            level: 0,
            timeEnd: Infinity,
            privateKey,
            publicKey
        });
    }

    /******************************/

    createNewIdentity(level: number, timeEnd: number) {
        const id = getUniqueUserId();
        const [ privateKey, publicKey ] = secp256k1.getKeys();

        this.$identityList.push({
            id,
            level,
            timeEnd,
            privateKey,
            publicKey
        });
    }

    id(): number;
    id(newValue: number): this;
    id(newValue?: number) {
        let topItem = this.$identityList[ this.$identityList.length - 1 ];
        while (topItem.timeEnd < Date.now()) {
            this.$identityList.pop();
            topItem = this.$identityList[ this.$identityList.length - 1 ];
        }
        if (newValue !== undefined) {
            topItem.id = newValue;
            return this;
        }
        return topItem.id;
    }

    privateKey(): Buffer;
    privateKey(newValue: Buffer): this;
    privateKey(newValue?: Buffer) {
        let topItem = this.$identityList[ this.$identityList.length - 1 ];
        while (topItem.timeEnd < Date.now()) {
            this.$identityList.pop();
            topItem = this.$identityList[ this.$identityList.length - 1 ];
        }
        if (newValue !== undefined) {
            topItem.privateKey = newValue;
            return this;
        }
        return topItem.privateKey;
    }

    publicKey(): Buffer;
    publicKey(newValue: Buffer): this;
    publicKey(newValue?: Buffer) {
        let topItem = this.$identityList[ this.$identityList.length - 1 ];
        while (topItem.timeEnd < Date.now()) {
            this.$identityList.pop();
            topItem = this.$identityList[ this.$identityList.length - 1 ];
        }
        if (newValue !== undefined) {
            topItem.publicKey = newValue;
            return this;
        }
        return topItem.publicKey;
    }
}