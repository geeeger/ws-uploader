import { EventEmitter } from "events";
import Interface from "../../types/interface";

export default class WorkerProvider extends EventEmitter implements Interface.WorkersProvider {
    taskConcurrency: number;
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
    public static asyncFnMover(fn: string): string {
        const blob = new Blob([`
            $$=${fn};
            onmessage=function (e) {
                Promise.resolve(function() {
                        return $$.apply($$, e.data);
                    })
                    .then(
                        function (res) {
                            postMessage({
                                channel: e.data.channel,
                                payload: res
                            });
                        },
                        function (err) {
                            postMessage({
                                channel: e.data.channel,
                                error: err
                            });
                        }
                    )
            };
        `], {
            type: "text/javascript",
        });
        return URL.createObjectURL(blob);
    }
    public workers: Interface.MyWorker[];
    public cpus: number;
    public messages: Interface.WorkerMessages[];
    public constructor(workerPath: string, taskConcurrency: number = 1) {
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

    public onmessage(e: MessageEvent): void {
        for (let i = 0; i < this.cpus; i++) {
            const worker = this.workers[i];
            if (e.target === worker.instance) {
                if (worker.tasks >= this.taskConcurrency) {
                    worker.buzy = false;
                    worker.tasks = 0;
                }
                this.run();
            }
        }
        const { channel, payload, error } = e.data;
        this.emit(channel, error, payload);
    }

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
            idleWorker.instance.postMessage.apply(idleWorker.instance, message);
        }
    }

    public send(message: Interface.WorkerMessage, options?: PostMessageOptions): void {
        this.messages.push([message, options]);
        this.run();
    }

    public destroy(): void {
        this.workers.forEach((worker: Interface.MyWorker): void => {
            worker.instance.terminate();
        });
        this.workers = [];
        this.messages = [];
        this.removeAllListeners();
    }

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
