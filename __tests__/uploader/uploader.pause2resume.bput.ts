import { TASK_STATUS_INFO } from './../../src/constants/status';
import { STATUS, WebFile } from './../../src/index';
import './../../scripts/setup.d';
import fetchMock from "jest-fetch-mock";
import { Crypto } from "@peculiar/webcrypto";

jest.setTimeout(5000)
global.crypto = new Crypto()

function delay(fn: any, time?: number) {
    return new Promise((res) => {
        setTimeout(() => {
            res(typeof fn === 'function' ? fn() : fn)
        }, time)
    })
}

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

describe('test src/index.js', () => {
    beforeEach(() => {
        let ctx = 0;
        // @ts-ignore
        global.fetch = fetchMock.mockIf(/^https:\/\/api.6pan.cn\//, (req) => {
            if (req.url.endsWith('/uploadToken')) {
                return delay({
                    body: JSON.stringify({
                        uploadToken: "123",
                        createInfo: {},
                        type: "plain/text",
                        filePath: "/your_daddy",
                        created: false,
                        partUploadUrl: "https://api.6pan.cn",
                        directUploadUrl: "https://api.6pan.cn"
                    })
                }, 1000)
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
                return delay({
                    body: JSON.stringify({
                        ctx: ctxMap[req.url.split('bput/')[1]],
                        checksum: '123',
                        crc32: '123',
                        offset: 11111
                    })
                }, 500)
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
                // console.log(ctx.statusInfo, ctx.getError())
                if (status === STATUS.DONE) {
                    expect(ctx.ctx.toCtxString()).toBe('ctx0-3,ctx1-3,ctx2-2')
                    done()
                }
            },
            debug: true
        })

        // console.log(uploader.file.getBlocks().map(item => item.getChunks()))
        uploader.upload()
        delay(() => {
            uploader.pause()
            delay(() => {
                uploader.resume()
            })
        }, 2000)
    })
})