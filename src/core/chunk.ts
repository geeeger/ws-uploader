/* eslint-disable @typescript-eslint/explicit-function-return-type */
import * as Interface from "../interface";
import Block from "./block";

/**
 * @description 生成上传所需的片结构的构造器
 * @export
 * @class Chunk
 * @implements {Interface.Chunk}
 */
export default class Chunk implements Interface.Chunk {
    /**
     * 父节点引用
     *
     * @type {Block}
     * @memberof Chunk
     */
    public block: Block;

    /**
     * 开始位置
     *
     * @type {number}
     * @memberof Chunk
     */
    public startByte: number;

    /**
     * 片结束位置
     *
     * @type {number}
     * @memberof Chunk
     */
    public endByte: number;

    /**
     * Creates an instance of Chunk.
     * @param {Block} block
     * @param {number} startByte
     * @param {number} endByte
     * @memberof Chunk
     */
    constructor(block: Block, startByte: number, endByte: number) {
        this.block = block;
        this.startByte = startByte;
        this.endByte = endByte;
    }

    /**
     * 片大小
     *
     * @readonly
     * @type {number}
     * @memberof Chunk
     */
    get size(): number {
        return this.endByte - this.startByte;
    }

    /**
     * 片在块中的索引
     *
     * @readonly
     * @type {number}
     * @memberof Chunk
     */
    get index(): number {
        return Math.floor(this.startByte / this.block.file.chunkSize);
    }

    /**
     * 获取二进制数据
     *
     * @readonly
     * @type {Blob}
     * @memberof Chunk
     */
    get blob(): Blob {
        const block = this.block;
        const file = block.file;
        const offset = block.index * file.blockSize;
        return file.slice(offset + this.startByte, offset + this.endByte);
    }
}