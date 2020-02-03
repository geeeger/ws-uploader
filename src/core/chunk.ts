/* eslint-disable @typescript-eslint/explicit-function-return-type */
import Interface from "../../types/interface";
import Block from "./block";

export default class Chunk implements Interface.Chunk {
    public block: Block;
    public startByte: number;
    public endByte: number;
    constructor(block: Block, startByte: number, endByte: number) {
        this.block = block;
        this.startByte = startByte;
        this.endByte = endByte;
    }

    get size() {
        return this.endByte - this.startByte;
    }

    get index() {
        return Math.floor(this.startByte / this.block.file.chunkSize);
    }

    get blob() {
        const block = this.block;
        const file = block.file;
        const offset = block.index * file.blockSize;
        return file.slice(offset + this.startByte, offset + this.endByte);
    }
}