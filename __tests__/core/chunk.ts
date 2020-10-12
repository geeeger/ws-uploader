import QZFile from '../../src/core/file';
import "../../scripts/setup.d";
const blockSize = 4 * 1024 * 1024;
const chunkSize = 1 * 1024 * 1024;

describe('test core/chunk.ts', () => {
    it('test File chunk', () => {
        const mockFile = MockFile('test.txt', 1, 'plain/text');
        const qzfile = new QZFile({
            file: mockFile,
            blockSize,
            chunkSize,
            batch: '1'
        });
        let chunks = qzfile.getBlocks()[0].getChunks();

        expect(chunks.length).toBe(1);
        let chunk = chunks[0];
        expect(chunk.block).toBe(qzfile.getBlockByIndex(0));
        expect(chunk.endByte).toBe(1);
        expect(chunk.startByte).toBe(0);
        expect(chunk.size).toBe(1);
    })

    it('test File chunk blob', async () => {
        expect.assertions(1);
        // @ts-ignore
        const mockFile = MockFile('test.txt', 1, 'plain/text');
        const qzfile = new QZFile({
            file: mockFile,
            blockSize,
            chunkSize,
            batch: '1'
        });
        let block = qzfile.getBlockByIndex(0);
        let chunk = block.getChunks()[0];
        const fr = new FileReader();
        let done: any;
        let buf: Promise<string> = new Promise((res) => {
            done = res
        })
        fr.addEventListener('load', function () {
            done(new Uint8Array(fr.result as ArrayBuffer)[0])
        }, false)
        fr.readAsArrayBuffer(chunk.blob);

        await expect(buf).resolves.toBe('a'.charCodeAt(0));
    })
});