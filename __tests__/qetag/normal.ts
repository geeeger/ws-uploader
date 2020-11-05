import "../../scripts/setup.d";
import Noraml from "../../src/qetag/normal";
import QZFile from "../../src/core/file";
import { Crypto } from "@peculiar/webcrypto";

global.crypto = new Crypto();

describe('test qetage/normal', () => {
    it('get hash', async () => {
        const qetag = new Noraml(new QZFile({
            file: MockFile('test', 1, 'plain/text')
        }))

        const result = 'Fob35Df6paf84V0d3Lnq6uo3dme41'

        expect(qetag.get()).toBe('')
        // qetag.set('test')
        // expect(qetag.get()).toBe('test')
        await expect(qetag.calc({})).resolves.toHaveProperty('hash', '')
        qetag.set('test')
        expect(qetag.get()).toBe('test')
    })
})