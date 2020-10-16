import { TASK_STATUS_INFO } from './../../src/constants/status';
import { STATUS, WebFile } from './../../src/index';
import './../../scripts/setup.d';
import fetchMock from "jest-fetch-mock";
import { Crypto } from "@peculiar/webcrypto";

jest.setTimeout(5000)
global.crypto = new Crypto()

let flag = false

const ctxMap: {
    [key: string]: any
} = {
    '4194304/0': 'ctx0',
    '4194304/1': 'ctx1',
    '2098210/2': 'ctx2',
    'ctx0/1048576': 'ctx0-1',
    'ctx0-1/2097152': 'ctx0-2',
    'ctx0-2/3145728': 'ctx0-3',
    'ctx1/1048576': 'ctx1-1',
    'ctx1-1/2097152': 'ctx1-2',
    'ctx1-2/3145728': 'ctx1-3',
    'ctx2/1048576': 'ctx2-1',
    'ctx2-1/2097152': 'ctx2-2',
    'ctx2-2/3145728': 'ctx2-3',
}

let count = 0;

describe('test src/index.js', () => {
    beforeEach(() => {
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
                        ctx: ctxMap[req.url.split('mkblk/')[1]],
                        checksum: '123',
                        crc32: '123',
                        offset: 11111
                    })
                })
            }
            if (req.url.includes('/bput/')) {
                if (count >= 2) {
                    flag = true
                }
                count++
                // @ts-ignore
                return Promise[flag ? 'resolve' : 'reject']({
                    body: JSON.stringify({
                        ctx: ctxMap[req.url.split('bput/')[1]],
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
                if (status === STATUS.DONE) {
                    expect(ctx.ctx.toCtxString()).toBe('ctx0-3,ctx1-3,ctx2-2')
                    done()
                }
            },
            debug: true
        })
        uploader.upload()
    })
})