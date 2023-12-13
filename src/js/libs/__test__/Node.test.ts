import sampleModule from "./sampleModule";

describe('main', () => {
  it('create module', (done) => {
    const module = sampleModule({});

    const testBuff = Buffer.from('FA', 'hex');
    
    expect(module.api.test()).toBe('ABCDEF');

    module.out((value) => {
      expect(value).toBe('fa');
      expect(module.api.test()).toBe('ABCDEF');
      done();
    });
    module.in(testBuff);
  });
});
