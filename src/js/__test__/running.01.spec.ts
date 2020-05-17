import createNodeCore, * as core from "@/nodeCore";
import LazyPromise from "@/libs/LazyPromise";
import fs from "fs";

/******************************/

const DIR_TEST = __filename.replace(/ts$/, 'dir');

try {
    fs.mkdirSync(DIR_TEST);
} catch (error) {}

describe('live cycle', () => {
    const instance = createNodeCore(DIR_TEST);
    const log = [] as number[];
    const waitForReady = new LazyPromise();
    const waitForDestroy = new LazyPromise();

    const cbInit = jest.fn(() => log.push(1));
    const cbInitDbBefore = jest.fn(() => log.push(2));
    const cbInitDbAfter = jest.fn(() => log.push(3));
    const cbCoreReady = jest.fn(() => {
        log.push(4);
        waitForReady.resolve();
    });
    const cbDestroyBefore = jest.fn(() => log.push(5));
    const cbDestroyDbBefore = jest.fn(() => log.push(6));
    const cbDestroyDbAfter = jest.fn(() => log.push(7));
    const cbDestroyAfter = jest.fn(() => {
        log.push(8);
        waitForDestroy.resolve();
    });

    // wszystkie moduły załadowane
    instance.events.on('init', cbInit);
    // uruchamianie baz
    instance.events.on('init/db/before', cbInitDbBefore);
    instance.events.on('init/db/after', cbInitDbAfter);
    // gotowy do startu
    instance.events.on('core/ready', cbCoreReady);
    // przed rozpoczęciem zamykania, jeszcze nic nie jest ruszone
    instance.events.on('destroy/before', cbDestroyBefore);
    // zamknięcie baz
    instance.events.on('destroy/db/before', cbDestroyDbBefore);
    instance.events.on('destroy/db/after', cbDestroyDbAfter);
    // po zakończeniu zamykania
    instance.events.on('destroy/after', cbDestroyAfter);

    it('tworzenie instancji', async () => {
        const state1 = instance.getState();

        await waitForReady.get();

        const state2 = instance.getState();

        expect(cbInit).toBeCalledTimes(1);
        expect(cbInitDbBefore).toBeCalledTimes(1);
        expect(cbInitDbAfter).toBeCalledTimes(1);
        expect(cbCoreReady).toBeCalledTimes(1);

        expect(state1).toBe(core.STATE_INIT);
        expect(state2).toBe(core.STATE_READY);
    }, 10e3);

    it('zamykanie instancji', async () => {
        const state1 = instance.getState();

        instance.destroy();

        const state2 = instance.getState();

        await waitForDestroy.get();

        const state3 = instance.getState();

        expect(cbDestroyBefore).toBeCalledTimes(1);
        expect(cbDestroyAfter).toBeCalledTimes(1);
        expect(cbDestroyDbBefore).toBeCalledTimes(1);
        expect(cbDestroyDbAfter).toBeCalledTimes(1);

        expect(state1).toBe(core.STATE_READY);
        expect(state2).toBe(core.STATE_DESTROYING);
        expect(state3).toBe(core.STATE_DESTROYED);
    }, 10e3);

    it('sprawdzanie kolejności', async () => {
        expect(log).toEqual([1,2,3,4,5,6,7,8]);
    });
});