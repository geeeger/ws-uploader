import WorkerProvider from "../../src/worker";
import MyWorkerAdapter from "../../src/http/worker";
import workerScript from "../../src/http/worker-script";
import fetchMock from "jest-fetch-mock";
// @ts-ignore
global.fetch = fetchMock.mockIf(/^http:\/\/test\//, (req) => {
    return Promise.resolve({
        body: JSON.stringify({a: 'hello'})
    })
})
import "jsdom-worker";
import "../../scripts/setup.d";

describe('test src/http', () => {
    it('test worker class', async () => {
        // expect.assertions(2)
        const wp = new WorkerProvider(WorkerProvider.asyncFnMover(workerScript))

        const mwa = new MyWorkerAdapter({
            workers: wp
        })

        const mockFile = MockFile('test.txt', 1, 'plain/text');

        await expect(mwa.post({
            url: 'http://test/',
            data: mockFile
        })).resolves.toEqual({a: 'hello'})
    })
})