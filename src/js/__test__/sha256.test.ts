import { sha256, HashSum } from '../services/crypto/sha256';

/******************************/

it('sha256', () => {
    const testMap = {
        'test': '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
        'sha256': '5d5b09f6dcb2d53a5fffc60c4ac0d55fabdf556069d6631545f42aa6e3500f2e'
    };

    for (let inputValue in testMap) {
        let expectValue = testMap[ inputValue ];

        expect(sha256(inputValue)).toBe(expectValue);
    }
});
