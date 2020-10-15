import Base from '../../src/core/base';
import Status, { STATUS } from '../../src/core/status';

describe('test core/status.ts', () => {
    it('test constructor()', () => {
        const status = new Status()

        expect(status.isPending()).toBeTruthy()

        const fn = jest.fn()
        status.addStatusHandler(STATUS.DONE, fn)
        status.setStatus(STATUS.DONE)
        expect(status.isDone()).toBeTruthy()
        expect(status.isCalculating()).toBeFalsy()
        expect(fn).toBeCalledTimes(1)

        Status.config({chunkRetry: 4})

        status.markTry(5)
        expect(status.isTryout()).toBeTruthy()
        expect(Base.default.chunkRetry).toBe(4)
    });
});