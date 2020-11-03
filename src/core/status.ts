/* eslint-disable @typescript-eslint/ban-types */
import { STATUS, TASK_STATUS_INFO, UPLOADING_STATUS } from "../constants/status";
import Base from "./base";

export { STATUS, TASK_STATUS_INFO, UPLOADING_STATUS } from '../constants/status';

/**
 * 状态类
 *
 * @class Status
 * @extends {Base}
 */
class Status extends Base {
    /**
     * 状态
     *
     * @type {STATUS}
     * @memberof Status
     */
    status: STATUS = STATUS.PENDING

    /**
     * 储存状态处理函数
     *
     * @type {{
     *         [key: string]: Function
     *     }}
     * @memberof Status
     */
    _statusHandlers: {
        [key: string]: Function
    } = {}

    /**
     * 重试次数
     *
     * @memberof Status
     */
    tryCount = 0

    /**
     * 错误数组
     *
     * @type {Error[]}
     * @memberof Status
     */
    error: Error[] = [];

    /**
     * 状态信息（中文）
     *
     * @readonly
     * @type {string}
     * @memberof Status
     */
    get statusInfo(): string {
        return TASK_STATUS_INFO[this.status];
    }

    /**
     * 重置重试次数
     *
     * @memberof Status
     */
    restTryCount(): void {
        this.tryCount = 0
    }

    /**
     * 获取错误数组
     *
     * @return {*}  {Error[]}
     * @memberof Status
     */
    getError(): Error[] {
        return this.error;
    }

    /**
     * 将错误push至错误数组中
     *
     * @param {Error} e
     * @memberof Status
     */
    recordError(e: Error): void {
        this.error.push(e);
    }

    /**
     * 标记一次重试
     *
     * @param {number} [tryNum]
     * @memberof Status
     */
    markTry(tryNum?: number): void {
        if (tryNum) {
            this.tryCount = tryNum;
        }
        else {
            this.tryCount++;
        }
    }

    /**
     * 增加状态监听
     *
     * @param {STATUS} status
     * @param {Function} handler
     * @return {*}  {this}
     * @memberof Status
     */
    addStatusHandler(status: STATUS, handler: Function): this {
        this._statusHandlers[status] = handler
        return this
    }

    /**
     * 设置状态并同时触发状态监听
     *
     * @param {STATUS} status
     * @memberof Status
     */
    setStatus(status: STATUS): void {
        this.status = status
        const handler = this._statusHandlers[status]

        if (handler) {
            handler()
        }
    }

    /**
     * 是否为上传状态
     *
     * @return {*}  {boolean}
     * @memberof Status
     */
    isUploading(): boolean {
        return this.status in UPLOADING_STATUS;
    }

    /**
     * 是否为失败状态
     *
     * @return {*}  {boolean}
     * @memberof Status
     */
    isFailed(): boolean {
        return this.status === STATUS.FAILED;
    }

    /**
     * 是否超过重试次数
     *
     * @return {*}  {boolean}
     * @memberof Status
     */
    isTryout(): boolean {
        return this.tryCount > Base.default.chunkRetry;
    }

    /**
     * 是否为完成状态
     *
     * @return {*}  {boolean}
     * @memberof Status
     */
    isDone(): boolean {
        return this.status === STATUS.DONE;
    }

    /**
     * 是否为pending状态
     *
     * @return {*}  {boolean}
     * @memberof Status
     */
    isPending(): boolean {
        return this.status === STATUS.PENDING;
    }

    /**
     * 是否为取消状态
     *
     * @return {*}  {boolean}
     * @memberof Status
     */
    isCancel(): boolean {
        return this.status === STATUS.CANCEL;
    }

    /**
     * 是否为计算哈希状态
     *
     * @return {*}  {boolean}
     * @memberof Status
     */
    isCalculating(): boolean {
        return this.status === STATUS.CALCULATING;
    }

    /**
     * 是否为准备上传状态
     *
     * @return {*}  {boolean}
     * @memberof Status
     */
    isPreparing(): boolean {
        return this.status === STATUS.PREPARING;
    }

    /**
     * 是否为暂停状态
     *
     * @return {*}  {boolean}
     * @memberof Status
     */
    isPaused(): boolean {
        return this.status === STATUS.PAUSE;
    }
}

export default Status