import QZFile from './../../src/core/file';
import Ctx from '../../src/core/ctx';
import "../../scripts/setup.d";

describe('test core/ctx.ts', () => {
    it('test Ctx constructor', () => {
        const ctx = new Ctx();
        const orifile = MockFile('test.jsx', 4 * 1024 * 1024 + 100, 'plain/text')
        const file = new QZFile({
            file: orifile
        })
        expect(ctx).toBeDefined();
        ctx.add('1', file.getBlockByIndex(0).getChunkByIndex(0))
        ctx.add('2', file.getBlockByIndex(0).getChunkByIndex(1))
        ctx.add('3', file.getBlockByIndex(0).getChunkByIndex(2))
        ctx.add('4', file.getBlockByIndex(0).getChunkByIndex(3))
        ctx.add('5', file.getBlockByIndex(1).getChunkByIndex(0))
        expect(ctx.length).toBe(2);
        expect(ctx.size).toBe(5);

        expect(ctx.stringify()).toBe(JSON.stringify({
            0: ['1','2','3','4'],
            1: ['5'],
            length: 2
        }));

        expect(ctx.toArray()).toEqual([['1','2','3','4'],['5']])

        expect(ctx.toCtxString()).toEqual('4,5')

        ctx.remove(0)
        expect(ctx.length).toBe(1)
        expect(ctx.size).toBe(1)
        expect(ctx.stringify()).toBe(JSON.stringify({
            1: ['5'],
            length: 1
        }))
        expect(ctx.toArray()).toEqual([undefined])
        expect(ctx.clearArray()).toEqual([])
        expect(ctx.selfEqual()).toBeFalsy()
        ctx.remove(1)
        expect(ctx.length).toBe(0)
        expect(ctx.size).toBe(0)
        ctx.remove(2)
        expect(ctx.length).toBe(0)
        expect(ctx.size).toBe(0)
    });
});