/* eslint-disable @typescript-eslint/ban-types */
import { STATUS, TASK_STATUS_INFO, UPLOADING_STATUS } from "../constants/status";
import Base from "./base";

export { STATUS, TASK_STATUS_INFO, UPLOADING_STATUS } from '../constants/status';

class Status extends Base {
    status: STATUS = STATUS.PENDING

    _statusHandlers: {
        [key: string]: Function
    } = {}

    tryCount = 0

    error: Error[] = [];

    get statusInfo(): string {
        return TASK_STATUS_INFO[this.status];
    }

    restTryCount(): void {
        this.tryCount = 0
    }

    getError(): Error[] {
        return this.error;
    }

    recordError(e: Error): void {
        this.error.push(e);
    }

    markTry(tryNum?: number): void {
        if (tryNum) {
            this.tryCount = tryNum;
        }
        else {
            this.tryCount++;
        }
    }

    addStatusHandler(status: STATUS, handler: Function): this {
        this._statusHandlers[status] = handler
        return this
    }

    setStatus(status: STATUS): void {
        this.status = status
        const handler = this._statusHandlers[status]

        if (handler) {
            handler()
        }
    }

    isUploading(): boolean {
        return this.status in UPLOADING_STATUS;
    }

    isFailed(): boolean {
        return this.status === STATUS.FAILED;
    }

    isTryout(): boolean {
        return this.tryCount > Base.default.chunkRetry;
    }

    isDone(): boolean {
        return this.status === STATUS.DONE;
    }

    isPending(): boolean {
        return this.status === STATUS.PENDING;
    }

    isCancel(): boolean {
        return this.status === STATUS.CANCEL;
    }

    isCalculating(): boolean {
        return this.status === STATUS.CALCULATING;
    }

    isPreparing(): boolean {
        return this.status === STATUS.PREPARING;
    }

    isPaused(): boolean {
        return this.status === STATUS.PAUSE;
    }
}

export default Status