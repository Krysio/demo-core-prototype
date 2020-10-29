import { Config, DiscreteTimeUnit } from '@/models/Config';
import Time from '@/services/Time';

/******************************/

export function createForFastTest() {
    const duration = 1;
    return Config.create({
        configBlockFrequency: 8,
        genesisTime: Time.now() - duration * 1e3,
        discreteBlockTime: [duration, DiscreteTimeUnit.s],
        discreteKeysTime: [duration, DiscreteTimeUnit.m]
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
