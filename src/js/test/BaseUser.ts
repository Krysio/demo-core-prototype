import * as secp256k1 from "@/services/crypto/ec/secp256k1";
import Node from "@/models/node";

/******************************/

export class TestBaseUser {
    protected $publicKey: Buffer;
    protected $privateKey: Buffer;
    protected $id: number = -1;

    constructor(
        protected $node: Node
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
    
    protected $randomBehaviorsEnabled = false;
    protected randomBehaviorsTimeRange = 10e3;
    
    startRandomBehaviors() {
        this.$randomBehaviorsEnabled = true;
        this.requestRandomBehavior();
    }

    requestRandomBehavior() {
        if (this.$randomBehaviorsEnabled) {
            setTimeout(this.randomBehavior, Math.random() * this.randomBehaviorsTimeRange);
        }
    }

    randomBehavior() {}
}