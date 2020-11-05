/* eslint-disable @typescript-eslint/no-unused-vars */
import QETagBase from "./base";
import * as Interface from "../interface";
import { guid } from "../core/utils";

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
     * @description 计算并获取hash
     * @param {*} [{ isTransferSupported, isEmitEvent, racePromise = new Promise((res) => {
     *             // do nothing
     *         }) }={}]
     * @return {*}  {Promise<this>}
     * @memberof QETagWorker
     */
    public calc(
        { isTransferSupported, isEmitEvent, racePromise = new Promise((res) => {
            // do nothing
        }) }: any = {}
    ): Promise<this> {
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
                        this.workers.removeAllListeners(this.channel);
                        this.hashs = hashs
                        resolve(this);
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
            }) as Promise<this>
        ])
    }
}
