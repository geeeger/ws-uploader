import * as Interface from "../interface";

import Block from "./block";
import { guid } from "./utils";

const rExt = /\.([^.]+)$/;
let uid = 1;

export type QZFileProps = Interface.QZFileProps;

export default class QZFile implements Interface.QZFile {
    public file: File;
    public batch: string;
    public blockSize: number;
    public chunkSize: number;
    public blocks: Block[];
    public name: string;
    public lastModified: number;
    public ext: string;
    public size: number;
    public type: string;
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

    public slice(start: number, end: number): Blob {
        const file = this.file;
        const slice = file.slice;
        return slice.call(file, start, end);
    }

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

    public getBlockByIndex(index: number): Block {
        return this.getBlocks()[index];
    }

    public getChunksSize(): number {
        return this.getBlocks().map(block => block.getChunks().length).reduce((a, b) => a + b, 0)
    }
}
