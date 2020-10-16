import Xhr from "../../src/http/xhr";
import fetchMock from "jest-fetch-mock";

describe('test src/index.js', () => {
    beforeEach(() => {
        let ctx = 0;
        // @ts-ignore
        global.fetch = fetchMock.mockIf(/^https:\/\/api.6pan.cn\//, (req) => {
            if (req.url.endsWith('/uploadToken')) {
                return Promise.resolve({
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
                        response: {}
                    })
                })
            }
        })
    })

    it('test class', () => {
        expect(1).toBe(1)
    })
})