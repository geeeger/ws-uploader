import Ctx from '../../src/core/ctx';
import "../../scripts/setup.d";

describe('test core/ctx.ts', () => {
    it('test Ctx constructor', () => {
        const ctx = new Ctx();
        expect(ctx).toBeDefined();
    });
});