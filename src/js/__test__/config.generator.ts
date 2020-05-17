import Config, { DiscreteTimeUnit } from "../models/Config";

type Params = Parameters<typeof Config.create>[0];

export function getValidConfigParam(custom: Params = {}) {
    const config: Parameters<typeof Config.create>[0] = {
        genesisTime: Date.now(),
        discreteBlockTime: [1, DiscreteTimeUnit.s],
        discreteKeysTime: [30, DiscreteTimeUnit.s],
        ...custom
    };
    return config;
}
export function createValidConfig(custom?: Params) {
    return Config.create(getValidConfigParam(custom));
}