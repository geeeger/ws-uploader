import * as Interface from "../interface";
import Chunk from "./chunk";
import QZFile from "./file";

/**
 * @description 生成上传所需块结构的构造器
 * @export
 * @class Block
 * @implements {Interface.Block}
 */
export default class Block implements Interface.Block {
    /**
     * 块开始位置
     *
     * @type {number}
     * @memberof Block
     */
    public startByte: number;

    /**
     * 块结束位置
     *
     * @type {number}
     * @memberof Block
     */
    public endByte: number;

    /**
     * 父节点引用
     *
     * @type {QZFile}
     * @memberof Block
     */
    public file: QZFile;

    /**
     * 储存的片信息
     *
     * @type {Chunk[]}
     * @memberof Block
     */
    public chunks: Chunk[];

    /**
     * Creates an instance of Block.
     * @param {QZFile} file
     * @param {number} startByte
     * @param {number} endByte
     * @memberof Block
     */
    public constructor(file: QZFile, startByte: number, endByte: number) {
        this.file = file;
        this.startByte = startByte;
        this.endByte = endByte;
        this.chunks = [];
    }

    /**
     * 获取所有片信息（lazy）
     *
     * @return {*}  {Chunk[]}
     * @memberof Block
     */
    getChunks(): Chunk[] {
        if (this.chunks.length) {
            return this.chunks;
        }
        let startByte = 0;
        const chunks = [];
        while (startByte < this.size) {
            let endByte = startByte + this.file.chunkSize;
            if (endByte > this.size) {
                endByte = this.size;
            }
            chunks.push(new Chunk(this, startByte, endByte));
            startByte += this.file.chunkSize;
        }
        this.chunks = chunks;
        return chunks;
    }

    /**
     * 按索引获取片信息
     *
     * @param {number} index
     * @return {*}  {Chunk}
     * @memberof Block
     */
    getChunkByIndex(index: number): Chunk {
        return this.getChunks()[index];
    }

    /**
     * 获取块大小
     *
     * @readonly
     * @type {number}
     * @memberof Block
     */
    get size(): number {
        return this.endByte - this.startByte;
    }

    /**
     * 获取块在文件中的索引位置
     *
     * @readonly
     * @type {number}
     * @memberof Block
     */
    get index(): number {
        return Math.round(this.startByte / this.file.blockSize);
    }

    /**
     * 获取二进制数据
     *
     * @readonly
     * @type {Blob}
     * @memberof Block
     */
    get blob(): Blob {
        return this.file.slice(this.startByte, this.endByte);
    }
}
