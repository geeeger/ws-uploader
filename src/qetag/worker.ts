import Base64 = require("crypto-js/enc-base64");
import LibWordArray = require("crypto-js/lib-typedarrays");
import SHA1 = require("crypto-js/sha1");
import log2 from "math-log2";
import QETagBase from "./base";
import Interface from "../../types/interface";
import { guid } from "../core/utils";

export default class QETagWorker extends QETagBase implements Interface.QETagWorker {
    public workers: Interface.WorkersProvider;
    public channel: string;

    constructor(file: Interface.QZFile, opts: {
        workers: Interface.WorkersProvider
    }) {
        super(file);
        this.workers = opts.workers;
        this.channel = guid();
    }

    public get({ isTransferSupported, isEmitEvent }: any = {}): Promise<string> {
        const Promise = QETagWorker.Promise;
        if (this.hash) {
            return Promise.resolve(this.hash);
        }
        this.workers.removeMessagesByChannel(this.channel);
        this.workers.removeAllListeners(this.channel);
        return new Promise((resolve, reject): void => {
            const blocks = this.file.getBlocks();
            const blocksLength = blocks.length;
            let hashs: any[] = [];
            let hashsLength = 0;
            this.workers.on(this.channel, (error: any, payload: any): void => {
                if (error) {
                    this.workers.removeAllListeners(this.channel);
                    reject(new Error(payload));
                }
                hashs[payload.index] = payload.data;
                hashsLength++;
                this.process = parseFloat((hashsLength * 100 / blocksLength).toFixed(2));
                isEmitEvent && this.emit(QETagWorker.Events.UpdateProgress, this.process);
                if (hashsLength === blocksLength) {
                    hashs = hashs.map((hash: string): any => Base64.parse(hash));
                    let perfex = log2(this.file.blockSize);
                    const isSmallFile = hashsLength === 1;
                    let result = null;
                    if (isSmallFile) {
                        result = hashs[0];
                    } else {
                        perfex = 0x80 | perfex;
                        result = hashs.reduce((a, b): any => a.concat(b));
                        result = SHA1(result);
                    }
                    const byte = new ArrayBuffer(1);
                    const dv = new DataView(byte);
                    dv.setUint8(0, perfex);
                    result = LibWordArray.create(byte).concat(result);
                    result = result
                        .toString(Base64)
                        .replace(/\//g, "_")
                        .replace(/\+/g, "-");

                    this.hash = result;
                    this.workers.removeAllListeners(this.channel);
                    resolve(result);
                }
            });
            blocks.forEach((block: Interface.Block): void => {
                const opts = isTransferSupported ? {
                    transfer: [block.blob]
                } : undefined;
                this.workers.send({
                    channel: this.channel,
                    payload: {
                        blob: block.blob,
                        index: block.index,
                    },
                }, opts);
            });
        });
    }
}
