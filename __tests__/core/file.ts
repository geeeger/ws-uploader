import QZFile from '../../src/core/file';
const blockSize = 4 * 1024 * 1024;
const chunkSize = 1 * 1024 * 1024;

describe('test core/file.ts', () => {
    it('test File constructor', () => {
        const mockFile = MockFile('test.txt', 1, 'plain/text');
        const qzfile = new QZFile({
            file: mockFile,
            blockSize,
            chunkSize,
            batch: '1'
        });
        expect(qzfile.batch).toBe('1');
        expect(qzfile.blockSize).toBe(blockSize);
        expect(qzfile.chunkSize).toBe(chunkSize);
        expect(qzfile.ext).toBe('txt');
        expect(qzfile.file).toBe(mockFile);
        expect(qzfile.lastModified).toEqual(expect.any(Number));
        expect(qzfile.name).toBe('test.txt');
        expect(qzfile.size).toBe(1);
        expect(qzfile.type).toBe('plain/text');
    });

    // it('test File blocks', () => {
    //     const mockFile = MockFile('test.txt', 1, 'plain/text');
    //     const qzfile = new QZFile({
    //         file: mockFile,
    //         blockSize,
    //         chunkSize,
    //         batch: '1'
    //     });
    //     expect(qzfile.blocks.length).toBe(0);
    //     expect(qzfile.getBlocks().length).toBe(1);
    //     expect(qzfile.blocks.length).toBe(1);
    // })
});