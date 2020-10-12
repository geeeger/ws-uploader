import * as Interface from "../interface";
import Chunk from "./chunk";
import QZFile from "./file";

export default class Block implements Interface.Block {
    public startByte: number;
    public endByte: number;
    public file: QZFile;
    public chunks: Chunk[];
    public constructor(file: QZFile, startByte: number, endByte: number) {
        this.file = file;
        this.startByte = startByte;
        this.endByte = endByte;
        this.chunks = [];
    }

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

    getChunkByIndex(index: number): Chunk {
        return this.getChunks()[index];
    }

    get size(): number {
        return this.endByte - this.startByte;
    }

    get index(): number {
        return Math.round(this.startByte / this.file.blockSize);
    }

    get blob(): Blob {
        return this.file.slice(this.startByte, this.endByte);
    }
}
