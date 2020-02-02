import { WordArray } from "crypto-js";
import Base64 = require("crypto-js/enc-base64");
import LibWordArray = require("crypto-js/lib-typedarrays");
import SHA1 = require("crypto-js/sha1");
import log2 from "math-log2";
import throat from "throat";
import QETagBase from "./base";
import Interface from "../../types/interface";

export default class QETagNormal extends QETagBase implements Interface.QETagNormal {
    public concurrency: number;

    constructor(file: Interface.QZFile, opts?: any) {
        super(file);
        this.concurrency = window.navigator.hardwareConcurrency || 1;
    }

    public loadNext(block: Interface.Block): PromiseLike<WordArray> {
        const Promise = QETagNormal.Promise;
        return new Promise((resolve, reject): void => {
            const fr = new FileReader();
            fr.onload = (): void => {
                if (fr.result) {
                    const wordarray = LibWordArray.create(fr.result);
                    const sha1 = SHA1(wordarray);
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

    public get({ isEmitEvent }: any = {}): Promise<string> {
        const Promise = QETagNormal.Promise;
        if (this.hash) {
            return Promise.resolve(this.hash);
        }
        const blocks = this.file.getBlocks();
        const blocksLength = blocks.length;
        let hashsLength = 0;
        return Promise.all(
            blocks
                // @ts-ignore
                .map(throat(Promise).apply(this, [this.concurrency, (block: Interface.Block): PromiseLike<WordArray> => {
                    return this.loadNext(block).then(sha1 => {
                        hashsLength++;
                        this.process = parseFloat((hashsLength * 100 / blocksLength).toFixed(2));
                        isEmitEvent && this.emit(QETagNormal.Events.UpdateProgress, this.process);
                        return sha1;
                    });
                }])),
        )
            .then((hashs: any[]): string => {
                let perfex = log2(this.file.blockSize);
                const isSmallFile = hashs.length === 1;
                let hash = null;
                if (isSmallFile) {
                    hash = hashs[0];
                } else {
                    perfex = 0x80 | perfex;
                    hash = hashs.reduce((a, b): WordArray[] => a.concat(b));
                    hash = SHA1(hash);
                }
                const byte = new ArrayBuffer(1);
                const dv = new DataView(byte);
                dv.setUint8(0, perfex);
                hash = LibWordArray.create(byte).concat(hash);
                hash = hash
                    .toString(Base64)
                    .replace(/\//g, "_")
                    .replace(/\+/g, "-");

                this.hash = hash;
                return hash;
            });
    }
}
