/* eslint-disable @typescript-eslint/no-unused-vars */
import QETagBase from "./base";
import * as Interface from "../interface";
import { guid, concatBuffer, arrayBufferToBase64, urlSafeBase64 } from "../core/utils";

/**
 * 提供计算qetag的worker服务
 *
 * @export
 * @class QETagWorker
 * @extends {QETagBase}
 * @implements {Interface.QETagWorker}
 */
export default class QETagWorker extends QETagBase implements Interface.QETagWorker {
    /**
     * 服务提供
     *
     * @type {Interface.WorkersProvider}
     * @memberof QETagWorker
     */
    public workers: Interface.WorkersProvider;
    /**
     * 消息频道
     *
     * @type {string}
     * @memberof QETagWorker
     */
    public channel: string;

    /**
     * Creates an instance of QETagWorker.
     * @param {Interface.QZFile} file
     * @param {{
     *         workers: Interface.WorkersProvider;
     *     }} opts
     * @memberof QETagWorker
     */
    constructor(file: Interface.QZFile, opts: {
        workers: Interface.WorkersProvider;
    }) {
        super(file);
        this.workers = opts.workers;
        this.channel = guid();
    }

    /**
     * 计算并获取hash
     *
     * @param {*} [{ isTransferSupported, isEmitEvent }={}]
     * @param {Promise<string>} [racePromise=new Promise((res) => {
     *             // do nothing
     *         })]
     * @return {*}  {Promise<string>}
     * @memberof QETagWorker
     */
    public get(
        { isTransferSupported, isEmitEvent }: any = {},
        racePromise: Promise<string> = new Promise((res) => {
            // do nothing
        })
    ): Promise<string> {
        if (this.hash) {
            return Promise.resolve(this.hash);
        }
        if (typeof crypto === 'undefined') {
            const error = new Error('Crypto API Error: crypto is not support');
            // console.error(error);
            return Promise.reject(error);
        }
        if (!crypto.subtle) {
            const error = new Error('Crypto API Error: crypto.subtle is supposed to be undefined in insecure contexts');
            return Promise.reject(error);
        }
        this.workers.removeMessagesByChannel(this.channel);
        this.workers.removeAllListeners(this.channel);
        return Promise.race([
            racePromise,
            new Promise((resolve, reject): void => {
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
                            result = await crypto.subtle.digest('SHA-1', result);
                        }
                        const byte = new ArrayBuffer(1);
                        const dv = new DataView(byte);
                        dv.setUint8(0, perfex);
                        result = concatBuffer(byte, result);
                        result = arrayBufferToBase64(result);
    
                        const calcedhash = urlSafeBase64(result) + this.file.size.toString(36);
                        this.workers.removeAllListeners(this.channel);
                        resolve(calcedhash);
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
            }) as Promise<string>
        ])
            .then(res => {
                if (res === 'race-to-stop') {
                    this.workers.removeMessagesByChannel(this.channel);
                }
                this.hash = res;
                return res;
            })
    }
}
