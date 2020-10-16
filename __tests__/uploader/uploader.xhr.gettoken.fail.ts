import { STATUS, WebFile } from './../../src/index';
import './../../scripts/setup.d';
import fetchMock from "jest-fetch-mock";
import { Crypto } from "@peculiar/webcrypto";

jest.setTimeout(5000)
global.crypto = new Crypto()

describe('test src/index.js', () => {
    beforeEach(() => {
        let ctx = 0;
        // @ts-ignore
        global.fetch = fetchMock.mockIf(/^https:\/\/api.6pan.cn\//, (req) => {
            if (req.url.endsWith('/uploadToken')) {
                return Promise.reject({
                    status: 404,
                    body: JSON.stringify({
                        uploadToken: "123",
                        createInfo: {},
                        type: "plain/text",
                        filePath: "/your_daddy",
                        created: false,
                        partUploadUrl: "https://api.6pan.cn",
                        directUploadUrl: "https://api.6pan.cn"
                    })
                })
            }
            if (req.url.includes('/mkblk/')) {
                return Promise.resolve({
                    body: JSON.stringify({
                        ctx: (ctx++).toString(),
                        checksum: '123',
                        crc32: '123',
                        offset: 11111
                    })
                })
            }
            if (req.url.includes('/bput/')) {
                return Promise.resolve({
                    body: JSON.stringify({
                        ctx: (ctx++).toString(),
                        checksum: '123',
                        crc32: '123',
                        offset: 11111
                    })
                })
            }
            if (req.url.includes('/mkfile/')) {
                return Promise.resolve({
                    body: JSON.stringify({
                        hash: 'li5xMevZpwZSfINNGuVUI2WF42rb68roi',
                        response: '{"hash": "li5xMevZpwZSfINNGuVUI2WF42rb68roi"}'
                    })
                })
            }
        })
    })

    it('test upload success', async (done) => {
        expect.assertions(1)

        let file = MockFile('test.wtf', 10 * 1024 * 1024 + 1058, 'plain/text')
        let uploader = new WebFile(file, {}, {
            adapter: 'Normal',
            onStatusChange: (ctx, status) => {
                if (status === STATUS.FAILED) {
                    expect(ctx.getError().length).toBe(1)
                    done()
                }
            }
        })
        uploader.upload()
    })
})