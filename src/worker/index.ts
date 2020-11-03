import { EventEmitter } from "events";
import * as Interface from "../interface";

/**
 * @description 管理worker线程工具
 * @export
 * @class WorkerProvider
 * @extends {EventEmitter}
 * @implements {Interface.WorkersProvider}
 */
export default class WorkerProvider extends EventEmitter implements Interface.WorkersProvider {
    /**
     * 每个worker可容纳任务数
     *
     * @type {number}
     * @memberof WorkerProvider
     */
    taskConcurrency: number;

    /**
     * 是否支持可转移对象
     *
     * @static
     * @return {*}  {boolean}
     * @memberof WorkerProvider
     */
    public static isTransferablesSupported(): boolean {
        return ((): boolean => {
            // See
            // https://developers.google.com/web/updates/2011/12/Transferable-Objects-Lightning-Fast
            const buffer = new ArrayBuffer(1);
            try {
                const blob = new Blob([""], {
                    type: "text/javascript",
                });
                const urlObj = URL.createObjectURL(blob);

                const worker = new Worker(urlObj);
                worker.postMessage(buffer, [
                    buffer,
                ]);
                worker.terminate();
            } catch (e) {
                // nothing to do
            }
            return !Boolean(buffer.byteLength);
        })();
    }
    
    /**
     * 移动一般函数至worker
     *
     * @static
     * @param {Function} fn
     * @return {*}  {string}
     * @memberof WorkerProvider
     */
    public static asyncFnMover(fn: (...args: any[]) => any): string {
        const blob = new Blob([`
            $$=${fn.toString()};
            onmessage=function (e) {
                $$(e.data)
                    .then(function (res) {
                        var payload = {
                            data: res,
                            type: 'data'
                        };
                        postMessage({
                            channel: e.data.channel,
                            payload: payload
                        });
                    })
                    .catch(function (res) {
                        postMessage({
                            channel: e.data.channel,
                            payload: {
                                type: 'error',
                                data: {
                                    message: res.message,
                                    stack: res.stack
                                }
                            }
                        });
                    })
            };
        `], {
            type: "text/javascript",
        });
        return URL.createObjectURL(blob);
    }

    /**
     * worker实例数组
     *
     * @type {Interface.MyWorker[]}
     * @memberof WorkerProvider
     */
    public workers: Interface.MyWorker[];

    /**
     * 线程数
     *
     * @type {number}
     * @memberof WorkerProvider
     */
    public cpus: number;

    /**
     * 消息实例数组
     *
     * @type {Interface.WorkerMessages[]}
     * @memberof WorkerProvider
     */
    public messages: Interface.WorkerMessages[];
    public constructor(workerPath: string, taskConcurrency = 1) {
        super();
        this.workers = [];
        this.messages = [];
        this.cpus = window.navigator.hardwareConcurrency || 1;
        this.taskConcurrency = taskConcurrency;
        for (let i = 0; i < this.cpus; i++) {
            const worker: Interface.MyWorker = {
                buzy: false,
                instance: new Worker(workerPath),
                tasks: 0
            };
            this.workers.push(worker);
        }

        for (let i = 0; i < this.cpus; i++) {
            this.workers[i].instance.onmessage = this.onmessage.bind(this);
        }
    }

    /**
     * 返回消息处理函数
     *
     * @param {MessageEvent} e
     * @memberof WorkerProvider
     */
    public onmessage(e: MessageEvent): void {
        for (let i = 0; i < this.cpus; i++) {
            const worker = this.workers[i];
            if (e.target === worker.instance) {
                worker.buzy = false;
                worker.tasks--;
                this.run();
            }
        }
        const { channel, payload } = e.data;
        if (payload.type === 'error') {
            const err = new Error(payload.data.message)
            err.stack = payload.data.stack
            payload.data = err
        }
        this.emit(channel, payload);
    }

    /**
     * 寻找空闲worker，传送任务
     *
     * @memberof WorkerProvider
     */
    public run(): void {
        const idles = this.workers.filter((worker: Interface.MyWorker): boolean => !worker.buzy);
        for (let i = this.messages.length - 1; i >= 0; i--) {
            const idleWorker = idles.pop();
            if (!idleWorker) {
                break;
            }
            const message = this.messages.pop();
            if (!message) {
                break;
            }
            idleWorker.tasks++;
            if (idleWorker.tasks >= this.taskConcurrency) {
                idleWorker.buzy = true;
            }
            // eslint-disable-next-line prefer-spread
            idleWorker.instance.postMessage.apply(idleWorker.instance, message);
        }
    }

    /**
     * 发送任务
     *
     * @param {Interface.WorkerMessage} message
     * @param {PostMessageOptions} [options]
     * @memberof WorkerProvider
     */
    public send(message: Interface.WorkerMessage, options?: PostMessageOptions): void {
        this.messages.push([message, options]);
        this.run();
    }

    /**
     * 销毁
     *
     * @memberof WorkerProvider
     */
    public destroy(): void {
        this.workers.forEach((worker: Interface.MyWorker): void => {
            worker.instance.terminate();
        });
        this.workers = [];
        this.messages = [];
        this.removeAllListeners();
    }

    /**
     * 移除指定任务
     *
     * @param {Interface.WorkerMessage} message
     * @memberof WorkerProvider
     */
    public removeMessage(message: Interface.WorkerMessage): void {
        if (this.messages) {
            for (let index = 0; index < this.messages.length; index++) {
                const element = this.messages[index][0];
                if (element === message) {
                    this.messages.splice(index, 1);
                    break;
                }
            }
        }
    }

    /**
     * 按消息通道移除任务
     *
     * @param {string} channel
     * @memberof WorkerProvider
     */
    public removeMessagesByChannel(channel: string): void {
        if (this.messages) {
            let index = 0;
            let element = this.messages[index];
            while (element) {
                const message = element[0];
                if (message.channel === channel) {
                    this.messages.splice(index, 1);
                } else {
                    index++;
                }
                element = this.messages[index];
            }
        }
    }
}
