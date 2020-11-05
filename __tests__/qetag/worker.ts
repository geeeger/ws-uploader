import "../../scripts/setup.d";
import WorkerTag from "../../src/qetag/worker";
import QZFile from "../../src/core/file";
import { Crypto } from "@peculiar/webcrypto";
import WorkerProvider from "../../src/worker";
import wscript from "../../src/qetag/worker-script";
import "jsdom-worker";

global.crypto = new Crypto();

describe('test qetage/normal', () => {
    it('get hash', async () => {
        const provider = new WorkerProvider(WorkerProvider.asyncFnMover(wscript))
        const qetag = new WorkerTag(new QZFile({
            file: MockFile('test', 1, 'plain/text')
        }), {
            workers: provider
        })

        const result = 'Fob35Df6paf84V0d3Lnq6uo3dme41'

        expect(qetag.get()).toBe('')
        await expect(qetag.calc({})).resolves.toHaveProperty('hash', '')
        // expect(qetag.get()).toBe('')
    })
})