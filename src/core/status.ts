/* eslint-disable @typescript-eslint/ban-types */
import { STATUS, TASK_STATUS_INFO, UPLOADING_STATUS } from "../constants/status";

export * from '../constants/status';

class Status {
    status: STATUS
    _statusHandlers: {
        [key: string]: Function
    }
    constructor() {
        this.status = STATUS.PENDING
        this._statusHandlers = {}
    }

    get statusInfo(): string {
        return TASK_STATUS_INFO[this.status];
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