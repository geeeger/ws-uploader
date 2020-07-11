import QETagBase from "./base";
import * as Interface from "../interface";
import { guid, concatBuffer, arrayBufferToBase64, urlSafeBase64 } from "../core/utils";

export default class QETagWorker extends QETagBase implements Interface.QETagWorker {
    public workers: Interface.WorkersProvider;
    public channel: string;

    constructor(file: Interface.QZFile, opts: {
        workers: Interface.WorkersProvider;
    }) {
        super(file);
        this.workers = opts.workers;
        this.channel = guid();
    }

    public get({ isTransferSupported, isEmitEvent }: any = {}): Promise<string> {
        if (this.hash) {
            return Promise.resolve(this.hash);
        }
        if (!window.crypto.subtle) {
            const error = new Error('Crypto API Error: crypto.subtle is supposed to be undefined in insecure contexts');
            // console.error(error);
            return Promise.reject(error);
        }
        this.workers.removeMessagesByChannel(this.channel);
        this.workers.removeAllListeners(this.channel);
        return new Promise((resolve, reject): void => {
            const blocks = this.file.getBlocks();
            const blocksLength = blocks.length;
            const hashs: any[] = [];
            let hashsLength = 0;
            this.workers.on(this.channel, async (payload: any): Promise<any> => {
                if (payload.type === 'error') {
                    this.workers.removeAllListeners(this.channel);
                    reject(new Error(payload.data));
                }
                hashs[payload.data.index] = payload.data.sha1;
                hashsLength++;
                this.process = parseFloat((hashsLength * 100 / blocksLength).toFixed(2));
                isEmitEvent && this.emit(QETagWorker.Events.UpdateProgress, this.process);
                if (hashsLength === blocksLength) {
                    let perfex = Math.log2(this.file.blockSize);
                    const isSmallFile = hashsLength === 1;
                    let result = null;
                    if (isSmallFile) {
                        result = hashs[0];
                    } else {
                        perfex = 0x80 | perfex;
                        result = hashs.reduce((a, b): ArrayBuffer => concatBuffer(a, b));
                        result = await window.crypto.subtle.digest('SHA-1', result);
                    }
                    const byte = new ArrayBuffer(1);
                    const dv = new DataView(byte);
                    dv.setUint8(0, perfex);
                    result = concatBuffer(byte, result);
                    result = arrayBufferToBase64(result);

                    this.hash = urlSafeBase64(result) + this.file.size.toString(36);
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
