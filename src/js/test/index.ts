import { TestRoot } from "./Root";
import Node from "@/models/node";
import { createGenesisiForFastTest } from "@/factories/block";

export function createGenesis(node: Node) {
    const root = new TestRoot(node);
    const genesis = createGenesisiForFastTest();

    root.id(0);
    root.privateKey(genesis.rootKey.privateKey);
    root.publicKey(genesis.rootKey.publicKey);

    node.takeBlock(genesis.blockGenesis);

    return root;
}
let nextUserId = 1;
export function getUniqueUserId() {
    return nextUserId++;
}
let nextDocumentId = 1;
export function getUniqueDocumentId() {
    return nextDocumentId++;
}