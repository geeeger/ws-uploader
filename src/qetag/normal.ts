/* eslint-disable @typescript-eslint/no-unused-vars */
import throat from "../third-parts/throat";
import QETagBase from "./base";
import * as Interface from "../interface";

/**
 * 提供计算qetag的普通服务
 *
 * @export
 * @class QETagNormal
 * @extends {QETagBase}
 * @implements {Interface.QETagNormal}
 */
export default class QETagNormal extends QETagBase implements Interface.QETagNormal {
    /**
     * 同时进行的任务数量
     *
     * @type {number}
     * @memberof QETagNormal
     */
    public concurrency: number;

    /**
     * Creates an instance of QETagNormal.
     * @param {Interface.QZFile} file
     * @param {*} [_]
     * @memberof QETagNormal
     */
    constructor(file: Interface.QZFile, _?: any) {
        super(file);
        this.concurrency = window.navigator.hardwareConcurrency || 1;
    }

    /**
     * 加载下一块数据并计算sha-1
     *
     * @param {Interface.Block} block
     * @return {*}  {Promise<ArrayBuffer>}
     * @memberof QETagNormal
     */
    public loadNext(block: Interface.Block): Promise<ArrayBuffer> {
        return new Promise((resolve, reject): void => {
            const fr = new FileReader();
            fr.onload = async (): Promise<any> => {
                if (fr.result) {
                    const sha1 = await crypto.subtle.digest('SHA-1', fr.result as ArrayBuffer)
                    resolve(sha1);
                } else {
                    reject(new Error("Read file error!"));
                }
            };
            fr.onloadend = (): void => {
                fr.onloadend = fr.onload = fr.onerror = null;
            };
            fr.onerror = (): void => {
                reject(new Error("Read file error!"));
            };
            fr.readAsArrayBuffer(block.blob);
        });
    }

    /**
     * @description 获取hash
     * @param {*} [{ isEmitEvent, racePromise = new Promise((res) => {
     *             // do nothing
     *         }) }={}]
     * @return {*}  {Promise<this>}
     * @memberof QETagNormal
     */
    public calc(
        { isEmitEvent, racePromise = new Promise((res) => {
            // do nothing
        }) }: any = {}
    ): Promise<this> {
        const blocks = this.file.getBlocks();
        const blocksLength = blocks.length;
        let hashsLength = 0;
        return Promise.race([
            racePromise,
            Promise.all(
                blocks
                    // @ts-ignore
                    .map(throat().apply(this, [this.concurrency, (block: Interface.Block): Promise<ArrayBuffer> => {
                        return Promise.race([
                            racePromise,
                            this.loadNext(block)
                        ]).then(sha1 => {
                            hashsLength++;
                            this.process = parseFloat((hashsLength * 100 / blocksLength).toFixed(2));
                            isEmitEvent && this.emit(QETagNormal.Events.UpdateProgress, this.process);
                            return sha1;
                        });
                    }])),
            )
                .then(async (hashs: any[]): Promise<any> => {
                    this.hashs = hashs
                    return this;
                })
        ])
    }
}
