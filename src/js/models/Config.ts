import bson from "bson";
import Time from "@/services/Time";

/******************************/

const BsonDeserializeOptions = { promoteBuffers: true };
export enum DiscreteTimeUnit {
    s = 0, m = 1, h = 2, d = 3
}
const TimeUnitMultipler = {
    [DiscreteTimeUnit.s]: 1e3,
    [DiscreteTimeUnit.m]: 1e3 * 60,
    [DiscreteTimeUnit.h]: 1e3 * 60 * 60,
    [DiscreteTimeUnit.d]: 1e3 * 60 * 60 * 24
};

/******************************/

export class Config {
    protected genesisTime: number;
    protected discreteBlockTime: [number, DiscreteTimeUnit];
    protected discreteKeysTime: [number, DiscreteTimeUnit];
    protected configBlockFrequency: number;

    constructor() { throw new Error('use Config.create({})'); }

    static create(data: {
        genesisTime?: Config['genesisTime'],
        discreteBlockTime?: Config['discreteBlockTime'],
        discreteKeysTime?: Config['discreteKeysTime'],
        configBlockFrequency?: Config['configBlockFrequency']
    } = {}): Config {
        data.genesisTime = data.genesisTime || Time.now();
        data.configBlockFrequency = data.configBlockFrequency || 1024;
        data.discreteBlockTime = data.discreteBlockTime || [5, DiscreteTimeUnit.m];
        data.discreteKeysTime = data.discreteKeysTime || [365, DiscreteTimeUnit.d];

        Object.setPrototypeOf(data, Config.prototype);

        //@ts-ignore
        return data as Config;
    }

    /******************************/

    getGenesisTime() { return this.genesisTime; }
    getDiscreteBlockPeriod() {
        return this.discreteBlockTime[0]
                * TimeUnitMultipler[this.discreteBlockTime[1]];
    }
    getDiscreteKeyPeriod() {
        return this.discreteKeysTime[0]
                * TimeUnitMultipler[this.discreteKeysTime[1]];
    }
    getConfigBlockFrequency() {
        return this.configBlockFrequency;
    }
    getEdorsingLimit() {
        return 8;
    }

    /******************************/

    isValid() {
        if (this.genesisTime === null
            || this.genesisTime < 0
        ) {
            return false;
        }

        if (this.discreteBlockTime === null
            || this.discreteBlockTime[0] < 0
            || !(this.discreteBlockTime[1] in DiscreteTimeUnit)
        ) {
            return false;
        }

        if (this.discreteKeysTime === null
            || this.discreteKeysTime[0] < 0
            || !(this.discreteKeysTime[1] in DiscreteTimeUnit)
        ) {
            return false;
        }

        return true;
    }

    /******************************/

    toBuffer() {
        return bson.serialize(this);
    }
    static fromBuffer(
        binData: Buffer
    ) {
        const data = bson.deserialize(binData, BsonDeserializeOptions);
        return Config.create(data);
    }
}