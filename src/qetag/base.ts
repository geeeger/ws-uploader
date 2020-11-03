import * as Interface from "../interface";
import { EventEmitter } from "events";

/**
 * 基类
 *
 * @export
 * @class QETagBase
 * @extends {EventEmitter}
 * @implements {Interface.QETagBase}
 */
export default class QETagBase extends EventEmitter implements Interface.QETagBase {
    /**
     * 事件
     *
     * @static
     * @memberof QETagBase
     */
    public static Events = {
        UpdateProgress: 'UpdateProgress'
    };

    /**
     * 传入的QZFile实例引用
     *
     * @type {Interface.QZFile}
     * @memberof QETagBase
     */
    public file: Interface.QZFile;

    /**
     * 储存的hash值
     *
     * @type {string}
     * @memberof QETagBase
     */
    public hash: string;

    /**
     * 计算hash进度
     *
     * @type {number}
     * @memberof QETagBase
     */
    public process: number;

    /**
     * Creates an instance of QETagBase.
     * @param {Interface.QZFile} file
     * @memberof QETagBase
     */
    public constructor(file: Interface.QZFile) {
        super();
        this.file = file;
        this.hash = "";
        this.process = 0;
    }

    /**
     * 同步设置hash值
     *
     * @param {string} hash
     * @memberof QETagBase
     */
    public set(hash: string): void {
        this.hash = hash;
    }

    /**
     * 同步获取hash值
     *
     * @return {*}  {string}
     * @memberof QETagBase
     */
    public getSync(): string {
        return this.hash;
    }

    public isExist(): boolean {
        return Boolean(this.hash);
    }
}
