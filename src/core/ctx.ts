import Chunk from "./chunk";

/**
 * @description 提供管理上传分片上下文的服务
 * @export
 * @class Ctx
 */
export default class Ctx {
    /**
     * 储存ctx，类数组存储对象
     *
     * @type {{
     *         [key: string]: any;
     *         length: number;
     *     }}
     * @memberof Ctx
     */
    ctx: {
        [key: string]: any;
        length: number;
    }

    /**
     * Creates an instance of Ctx.
     * @memberof Ctx
     */
    constructor() {
        this.ctx = {
            length: 0
        };
    }

    /**
     * 获取ctx的总数量
     *
     * @readonly
     * @type {number}
     * @memberof Ctx
     */
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

    /**
     * 获取ctx的长度
     *
     * @readonly
     * @type {number}
     * @memberof Ctx
     */
    get length(): number {
        return this.ctx.length;
    }

    /**
     * 清空某块ctx
     *
     * @param {number} index
     * @memberof Ctx
     */
    clear(index: number): void {
        if (this.ctx[index]) {
            this.ctx[index] = []
        }
    }

    /**
     * 移除某块ctx
     *
     * @param {number} index
     * @memberof Ctx
     */
    remove(index: number): void {
        if (this.ctx[index]) {
            delete this.ctx[index]
            this.ctx.length -= 1
        }
    }

    /**
     * 记录一个ctx
     *
     * @param {string} ctx
     * @param {Chunk} chunk
     * @memberof Ctx
     */
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

    /**
     * ctx类数组转换为数组
     *
     * @return {*}  {string[]}
     * @memberof Ctx
     */
    toArray(): string[] {
        return Array.from(this.ctx)
    }

    /**
     * 获取不含undefined项的ctx数组
     *
     * @return {*}  {string[]}
     * @memberof Ctx
     */
    clearArray(): string[] {
        return this.toArray().filter(i => i);
    }

    /**
     * 比较
     *
     * @return {*}  {boolean}
     * @memberof Ctx
     */
    selfEqual(): boolean {
        return this.clearArray().length === this.ctx.length;
    }

    // fixLength(): void {
    //     this.ctx.length = this.clearArray().length;
    // }

    /**
     * 提取每块最后一位ctx,生成mkfile所需的上下文字符串
     *
     * @return {*}  {string}
     * @memberof Ctx
     */
    toCtxString(): string {
        return this.clearArray().map(ctx => ctx[ctx.length - 1]).toString();
    }

    /**
     * toString
     *
     * @return {*}  {string}
     * @memberof Ctx
     */
    stringify(): string {
        return JSON.stringify(this.ctx);
    }
}