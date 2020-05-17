import Config from "../models/Config";
import { createValidConfig } from "./config.generator";

/******************************/

describe('Main', () => {
    it('Instance', () => {
        const config = Config.create({});

        expect(config).toBeInstanceOf(Config);
    });
    it('Methods', () => {
        const config = createValidConfig({
            genesisTime: 12345
        });

        expect(config.getGenesisTime()).toBe(12345);
        expect(config.getDiscreteBlockPeriod()).toBe(1e3);
        expect(config.getDiscreteKeyPeriod()).toBe(30e3);

        config['discreteBlockTime'] = [1, 1];
        expect(config.getDiscreteBlockPeriod()).toBe(60e3);
        config['discreteBlockTime'] = [1, 2];
        expect(config.getDiscreteBlockPeriod()).toBe(3600e3);
        config['discreteBlockTime'] = [1, 3];
        expect(config.getDiscreteBlockPeriod()).toBe(24 * 3600e3);
    });
    it('method isValid()', () => {
        const configInvalid = Config.create({genesisTime: -1});
        const configValid = createValidConfig();
        const resultInvalid: boolean = configInvalid.isValid();
        const resultValid: boolean = configValid.isValid();

        expect(resultInvalid).toBe(false);
        expect(resultValid).toBe(true);
    });
});