import { BaseStructure } from "./Base";
import { Hash } from "./Hash";

export class HashList extends BaseStructure {
    protected schema = {
        'keys': Hash
    };
}
