import QZFile from '../../src/core/file';
import "../../scripts/setup.d";
const blockSize = 4 * 1024 * 1024;
const chunkSize = 1 * 1024 * 1024;

describe('test core/block.ts', () => {
    it('test File blocks', () => {
        const mockFile = MockFile('test.txt', 1, 'plain/text');
        const qzfile = new QZFile({
            file: mockFile,
            blockSize,
            chunkSize,
            batch: '1'
        });
        expect(qzfile.blocks.length).toBe(0);
        expect(qzfile.getBlocks().length).toBe(1);
        expect(qzfile.blocks.length).toBe(1);
        let block = qzfile.blocks[0];
        expect(block.size).toBe(1);
        expect(block.startByte).toBe(0);
        expect(block.endByte).toBe(1);
        expect(block.index).toBe(0);
    })

    it('test File blocks blob', async () => {
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
        const fr = new FileReader();
        let done: any;
        let buf: Promise<string> = new Promise((res) => {
            done = res
        })
        fr.addEventListener('load', function () {
            done(new Uint8Array(fr.result as ArrayBuffer)[0])
        }, false)
        fr.readAsArrayBuffer(block.blob);

        await expect(buf).resolves.toBe('a'.charCodeAt(0));
    })
});