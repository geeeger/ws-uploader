import Chunk from "./chunk";

/**
 * @description 提供管理上传分片上下文的服务
 * @export
 * @class Ctx
 */
export default class Ctx {
    ctx: {
        [key: string]: any;
        length: number;
    }
    constructor() {
        this.ctx = {
            length: 0
        };
    }

    get size(): number {
        return Object.keys(this.ctx)
            .map(index => {
                const ctx = this.ctx[index]
                if (ctx && ctx.length) {
                    return ctx.length
                }
                return 0
            }).reduce((a, b) => a + b, 0);
    }

    get length(): number {
        return this.ctx.length;
    }

    clear(index: number): void {
        if (this.ctx[index]) {
            this.ctx[index] = []
        }
    }

    remove(index: number): void {
        if (this.ctx[index]) {
            delete this.ctx[index]
            this.ctx.length -= 1
        }
    }

    add(ctx: string, chunk: Chunk): void {
        if (chunk.index === 0) {
            if (!this.ctx[chunk.block.index]) {
                this.ctx[chunk.block.index] = []
                this.ctx.length += 1
            }
        }
        this.ctx[chunk.block.index][chunk.index] = ctx
        // this.fixLength()
    }

    toArray(): string[] {
        return Array.from(this.ctx)
    }

    clearArray(): string[] {
        return this.toArray().filter(i => i);
    }

    selfEqual(): boolean {
        return this.clearArray().length === this.ctx.length;
    }

    // fixLength(): void {
    //     this.ctx.length = this.clearArray().length;
    // }

    toCtxString(): string {
        return this.clearArray().map(ctx => ctx[ctx.length - 1]).toString();
    }

    stringify(): string {
        return JSON.stringify(this.ctx);
    }
}