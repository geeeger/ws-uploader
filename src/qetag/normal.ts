/* eslint-disable @typescript-eslint/no-unused-vars */
import throat from "../third-parts/throat";
import QETagBase from "./base";
import * as Interface from "../interface";
import { concatBuffer, arrayBufferToBase64, urlSafeBase64 } from "../core/utils";

export default class QETagNormal extends QETagBase implements Interface.QETagNormal {
    public concurrency: number;

    constructor(file: Interface.QZFile, _?: any) {
        super(file);
        this.concurrency = window.navigator.hardwareConcurrency || 1;
    }

    public loadNext(block: Interface.Block): Promise<ArrayBuffer> {
        return new Promise((resolve, reject): void => {
            const fr = new FileReader();
            fr.onload = async (): Promise<any> => {
                if (fr.result) {
                    const sha1 = await window.crypto.subtle.digest('SHA-1', fr.result as ArrayBuffer)
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

    public get(
        { isEmitEvent }: any = {},
        racePromise: Promise<string> = new Promise((res) => {
            // do nothing
        })
    ): Promise<string> {
        if (this.hash) {
            return Promise.resolve(this.hash);
        }
        if (!window.crypto.subtle) {
            const error = new Error('Crypto API Error: crypto.subtle is supposed to be undefined in insecure contexts');
            // console.error(error);
            return Promise.reject(error);
        }
        const blocks = this.file.getBlocks();
        const blocksLength = blocks.length;
        let hashsLength = 0;
        return Promise.race([
            racePromise,
            Promise.all(
                blocks
                    // @ts-ignore
                    .map(throat(Promise).apply(this, [this.concurrency, (block: Interface.Block): Promise<ArrayBuffer> => {
                        return Promise.race([
                            racePromise.then(() => {
                                throw new Error('Racing interrupted')
                            }),
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
                    let perfex = Math.log2(this.file.blockSize);
                    const isSmallFile = hashs.length === 1;
                    let hash = null;
                    if (isSmallFile) {
                        hash = hashs[0];
                    } else {
                        perfex = 0x80 | perfex;
                        hash = hashs.reduce((a, b): ArrayBuffer => concatBuffer(a, b));
                        hash = await window.crypto.subtle.digest('SHA-1', hash);
                    }
                    const byte = new ArrayBuffer(1);
                    const dv = new DataView(byte);
                    dv.setUint8(0, perfex);
                    hash = concatBuffer(byte, hash);
                    hash = arrayBufferToBase64(hash);
    
                    const calcedhash = urlSafeBase64(hash) + this.file.size.toString(36);
                    return calcedhash;
                })
        ])
            .then(res => {
                this.hash = res;
                return res;
            })
    }
}
