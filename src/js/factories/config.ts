import { Config, DiscreteTimeUnit } from '@/models/Config';
import Time from '@/services/Time';

/******************************/

export function createForFastTest() {
    return Config.create({
        configBlockFrequency: 8,
        genesisTime: Time.now() - 3e3,
        discreteBlockTime: [3, DiscreteTimeUnit.s],
        discreteKeysTime: [3, DiscreteTimeUnit.m]
    });
}
export function createForTest() {
    return Config.create({
        configBlockFrequency: 32,
        genesisTime: Time.now() - 10e3,
        discreteBlockTime: [10, DiscreteTimeUnit.s],
        discreteKeysTime: [10, DiscreteTimeUnit.m]
    });
}
