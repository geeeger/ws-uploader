import * as Interface from "../interface";

import Block from "./block";
import { guid } from "./utils";

const rExt = /\.([^.]+)$/;
let uid = 1;

export type QZFileProps = Interface.QZFileProps;

/**
 * @description 生成上传所需的文件结构构造器
 * @export
 * @class QZFile
 * @implements {Interface.QZFile}
 */
export default class QZFile implements Interface.QZFile {
    /**
     * 原始的文件对象
     *
     * @type {File}
     * @memberof QZFile
     */
    public file: File;

    /**
     * batchid
     *
     * @type {string}
     * @memberof QZFile
     */
    public batch: string;

    /**
     * 块大小
     *
     * @type {number}
     * @memberof QZFile
     */
    public blockSize: number;

    /**
     * 片大小
     *
     * @type {number}
     * @memberof QZFile
     */
    public chunkSize: number;

    /**
     * 所有块
     *
     * @type {Block[]}
     * @memberof QZFile
     */
    public blocks: Block[];

    /**
     * 文件名称
     *
     * @type {string}
     * @memberof QZFile
     */
    public name: string;

    /**
     * 文件最终修改时间
     *
     * @type {number}
     * @memberof QZFile
     */
    public lastModified: number;

    /**
     * 扩展名
     *
     * @type {string}
     * @memberof QZFile
     */
    public ext: string;

    /**
     * 文件大小
     *
     * @type {number}
     * @memberof QZFile
     */
    public size: number;

    /**
     * 文件mime类型
     *
     * @type {string}
     * @memberof QZFile
     */
    public type: string;

    /**
     * Creates an instance of QZFile.
     * @param {Interface.QZFileProps} {
     *         file,
     *         blockSize,
     *         chunkSize,
     *         batch,
     *     }
     * @memberof QZFile
     */
    public constructor({
        file,
        blockSize,
        chunkSize,
        batch,
    }: Interface.QZFileProps) {
        this.file = file;
        this.blockSize = blockSize || 4 * 1024 * 1024;
        this.batch = batch || guid();
        this.size = file.size;
        this.name = file.name || "unknown_" + uid++;
        this.lastModified = file.lastModified || new Date().getTime();
        this.blocks = [];
        this.chunkSize = chunkSize || 1 * 1024 * 1024;
        let ext: string = rExt.exec(file.name) ? RegExp.$1.toLowerCase() : "";
        if (!ext && file.type) {
            ext = /\/(jpg|jpeg|png|gif|bmp)$/i.exec(file.type) ? RegExp.$1.toLowerCase() : "";
            if (ext) {
                this.name += "." + ext;
            }
        }
        this.ext = ext;
        if (!file.type && this.ext && ~"jpg,jpeg,png,gif,bmp".indexOf(this.ext)) {
            this.type = "image/" + (this.ext === "jpg" ? "jpeg" : this.ext);
        } else {
            this.type = file.type || "application/octet-stream";
        }
    }

    /**
     * 文件二进制切割
     *
     * @param {number} start
     * @param {number} end
     * @return {*}  {Blob}
     * @memberof QZFile
     */
    public slice(start: number, end: number): Blob {
        const file = this.file;
        const slice = file.slice;
        return slice.call(file, start, end);
    }

    /**
     * 获取所有块信息
     *
     * @return {*}  {Block[]}
     * @memberof QZFile
     */
    public getBlocks(): Block[] {
        if (this.blocks.length) {
            return this.blocks;
        }
        let startByte = 0;
        const blocks = [];
        while (startByte < this.size) {
            let endByte = startByte + this.blockSize;
            if (endByte > this.size) {
                endByte = this.size;
            }
            blocks.push(new Block(this, startByte, endByte));
            startByte += this.blockSize;
        }
        this.blocks = blocks;
        return blocks;
    }

    /**
     * 按索引获取块信息
     *
     * @param {number} index
     * @return {*}  {Block}
     * @memberof QZFile
     */
    public getBlockByIndex(index: number): Block {
        return this.getBlocks()[index];
    }

    /**
     * 获取总片数量
     *
     * @return {*}  {number}
     * @memberof QZFile
     */
    public getChunksSize(): number {
        return this.getBlocks().map(block => block.getChunks().length).reduce((a, b) => a + b, 0)
    }
}
