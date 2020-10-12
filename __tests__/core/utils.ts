import * as api from '../../src/core/utils';

describe('test core/utils.ts', () => {
    it('test guid()', () => {
        const res = api.guid();
        expect(/^\w{8}-\w{4}-4\w{3}-\w{4}-\w{12}$/.test(res)).toBeTruthy();
    });

    it('test isBlob()', () => {
        expect(api.isBlob(new Blob([]))).toBeTruthy();
    });

    it('test isObject()', () => {
        expect(api.isObject({})).toBeTruthy();
    });

    it('test concatBuffer()', () => {
        const buf1 = new ArrayBuffer(1);
        const buf2 = new ArrayBuffer(2);
        expect(api.concatBuffer(buf1, buf2).byteLength).toBe(3);
    });

    it('test arrayBufferToBase64()', () => {
        const buf1 = new ArrayBuffer(1);
        expect(api.arrayBufferToBase64(buf1)).toBe('AA==');
    });

    it('test urlSafeBase64()', () => {
        expect(api.urlSafeBase64('\/+')).toBe('_-');
    });

    it('test createThrottle()', async () => {
        const runner = api.createThrottle(100);
        const mockfn = jest.fn();
        const mockfn1 = jest.fn();
        runner(mockfn);
        runner(mockfn1);
        await new Promise((res) => {
            setTimeout(() => {
                expect(mockfn).toBeCalledTimes(1);
                expect(mockfn1).toBeCalledTimes(0);
                res();
            }, 120);
        });
    })
});