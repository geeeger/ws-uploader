var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
define("interface", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
define("core/chunk", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Chunk {
        constructor(block, startByte, endByte) {
            this.block = block;
            this.startByte = startByte;
            this.endByte = endByte;
        }
        get size() {
            return this.endByte - this.startByte;
        }
        get index() {
            return Math.floor(this.startByte / this.block.file.chunkSize);
        }
        get blob() {
            const block = this.block;
            const file = block.file;
            const offset = block.index * file.blockSize;
            return file.slice(offset + this.startByte, offset + this.endByte);
        }
    }
    exports.default = Chunk;
});
define("core/block", ["require", "exports", "core/chunk"], function (require, exports, chunk_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    chunk_1 = __importDefault(chunk_1);
    class Block {
        constructor(file, startByte, endByte) {
            this.file = file;
            this.startByte = startByte;
            this.endByte = endByte;
            this.chunks = [];
        }
        getChunks() {
            if (this.chunks.length) {
                return this.chunks;
            }
            let startByte = 0;
            const chunks = [];
            while (startByte < this.size) {
                let endByte = startByte + this.file.chunkSize;
                if (endByte > this.size) {
                    endByte = this.size;
                }
                chunks.push(new chunk_1.default(this, startByte, endByte));
                startByte += this.file.chunkSize;
            }
            this.chunks = chunks;
            return chunks;
        }
        get size() {
            return this.endByte - this.startByte;
        }
        get index() {
            return Math.round(this.startByte / this.file.blockSize);
        }
        get blob() {
            return this.file.slice(this.startByte, this.endByte);
        }
    }
    exports.default = Block;
});
define("core/utils", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function guid() {
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
            const r = (Math.random() * 16) | 0;
            const v = c === "x" ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        });
    }
    exports.guid = guid;
    function isBlob(blob) {
        return Object.prototype.toString.call(blob) === '[object Blob]';
    }
    exports.isBlob = isBlob;
    function isObject(obj) {
        return Object.prototype.toString.call(obj) === '[object Object]';
    }
    exports.isObject = isObject;
    function concatBuffer(buf1, buf2) {
        const tmp = new Uint8Array(buf1.byteLength + buf2.byteLength);
        tmp.set(new Uint8Array(buf1), 0);
        tmp.set(new Uint8Array(buf2), buf1.byteLength);
        return tmp.buffer;
    }
    exports.concatBuffer = concatBuffer;
    function arrayBufferToBase64(buffer) {
        let binary = '';
        const bytes = new Uint8Array(buffer);
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    }
    exports.arrayBufferToBase64 = arrayBufferToBase64;
    function urlSafeBase64(base64) {
        return base64.replace(/\//g, "_").replace(/\+/g, "-");
    }
    exports.urlSafeBase64 = urlSafeBase64;
    function createThrottle(time) {
        let timer = null;
        return function throttle(fn) {
            if (timer) {
                return;
            }
            timer = setTimeout(() => {
                fn();
                timer = null;
            }, time);
        };
    }
    exports.createThrottle = createThrottle;
});
define("core/file", ["require", "exports", "core/block", "core/utils"], function (require, exports, block_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    block_1 = __importDefault(block_1);
    const rExt = /\.([^.]+)$/;
    let uid = 1;
    class QZFile {
        constructor({ file, blockSize, chunkSize, batch, }) {
            this.file = file;
            this.blockSize = blockSize || 4 * 1024 * 1024;
            this.batch = batch || utils_1.guid();
            this.size = file.size;
            this.name = file.name || "unknown_" + uid++;
            this.lastModified = file.lastModified || new Date().getTime();
            this.blocks = [];
            this.chunkSize = chunkSize || 1 * 1024 * 1024;
            let ext = rExt.exec(file.name) ? RegExp.$1.toLowerCase() : "";
            if (!ext && file.type) {
                ext = /\/(jpg|jpeg|png|gif|bmp)$/i.exec(file.type) ? RegExp.$1.toLowerCase() : "";
                if (ext) {
                    this.name += "." + ext;
                }
            }
            this.ext = ext;
            if (!file.type && this.ext && ~"jpg,jpeg,png,gif,bmp".indexOf(this.ext)) {
                this.type = "image/" + (this.ext === "jpg" ? "jpeg" : this.ext);
            }
            else {
                this.type = file.type || "application/octet-stream";
            }
        }
        slice(start, end) {
            const file = this.file;
            const slice = file.slice;
            return slice.call(file, start, end);
        }
        getBlocks() {
            if (this.blocks.length) {
                return this.blocks;
            }
            let startByte = 0;
            const blocks = [];
            while (startByte < this.size) {
                let endByte = startByte + this.blockSize;
                if (endByte > this.size) {
                    endByte = this.size;
                }
                blocks.push(new block_1.default(this, startByte, endByte));
                startByte += this.blockSize;
            }
            this.blocks = blocks;
            return blocks;
        }
        getBlockByIndex(index) {
            return this.getBlocks()[index];
        }
    }
    exports.default = QZFile;
});
define("qetag/base", ["require", "exports", "events"], function (require, exports, events_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class QETagBase extends events_1.EventEmitter {
        constructor(file) {
            super();
            this.file = file;
            this.hash = "";
            this.process = 0;
        }
        set(hash) {
            this.hash = hash;
        }
        getSync() {
            return this.hash;
        }
        isExist() {
            return Boolean(this.hash);
        }
    }
    exports.default = QETagBase;
    QETagBase.Events = {
        UpdateProgress: 'UpdateProgress'
    };
});
define("third-parts/throat", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function Delayed(resolve, fn, self, args) {
        this.resolve = resolve;
        this.fn = fn;
        this.self = self || null;
        this.args = args;
    }
    function Queue() {
        this._s1 = [];
        this._s2 = [];
    }
    Queue.prototype.push = function (value) {
        this._s1.push(value);
    };
    Queue.prototype.shift = function () {
        let s2 = this._s2;
        if (s2.length === 0) {
            const s1 = this._s1;
            if (s1.length === 0) {
                return;
            }
            this._s1 = s2;
            s2 = this._s2 = s1.reverse();
        }
        return s2.pop();
    };
    Queue.prototype.isEmpty = function () {
        return !this._s1.length && !this._s2.length;
    };
    function throat(PromiseArgument) {
        let Promise;
        function throat(size, fn) {
            const queue = new Queue();
            function run(fn, self, args) {
                if (size) {
                    size--;
                    const result = new Promise(function (resolve) {
                        resolve(fn.apply(self, args));
                    });
                    result.then(release, release);
                    return result;
                }
                else {
                    return new Promise(function (resolve) {
                        queue.push(new Delayed(resolve, fn, self, args));
                    });
                }
            }
            function release() {
                size++;
                if (!queue.isEmpty()) {
                    const next = queue.shift();
                    next.resolve(run(next.fn, next.self, next.args));
                }
            }
            if (typeof size === 'function') {
                const temp = fn;
                fn = size;
                size = temp;
            }
            if (typeof size !== 'number') {
                throw new TypeError('Expected throat size to be a number but got ' + typeof size);
            }
            if (fn !== undefined && typeof fn !== 'function') {
                throw new TypeError('Expected throat fn to be a function but got ' + typeof fn);
            }
            if (typeof fn === 'function') {
                return function () {
                    const args = [];
                    for (let i = 0; i < arguments.length; i++) {
                        args.push(arguments[i]);
                    }
                    return run(fn, this, args);
                };
            }
            else {
                return function (fn) {
                    if (typeof fn !== 'function') {
                        throw new TypeError('Expected throat fn to be a function but got ' + typeof fn);
                    }
                    const args = [];
                    for (let i = 1; i < arguments.length; i++) {
                        args.push(arguments[i]);
                    }
                    return run(fn, this, args);
                };
            }
        }
        if (arguments.length === 1 && typeof PromiseArgument === 'function') {
            Promise = PromiseArgument;
            return throat;
        }
        else {
            if (typeof Promise !== 'function') {
                throw new Error('You must provide a Promise polyfill for this library to work in older environments');
            }
            return throat(arguments[0], arguments[1]);
        }
    }
    exports.default = throat;
    ;
});
define("qetag/normal", ["require", "exports", "third-parts/throat", "qetag/base", "core/utils"], function (require, exports, throat_1, base_1, utils_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    throat_1 = __importDefault(throat_1);
    base_1 = __importDefault(base_1);
    class QETagNormal extends base_1.default {
        constructor(file, _) {
            super(file);
            this.concurrency = window.navigator.hardwareConcurrency || 1;
        }
        loadNext(block) {
            return new Promise((resolve, reject) => {
                const fr = new FileReader();
                fr.onload = () => __awaiter(this, void 0, void 0, function* () {
                    if (fr.result) {
                        const sha1 = yield window.crypto.subtle.digest('SHA-1', fr.result);
                        resolve(sha1);
                    }
                    else {
                        reject(new Error("Read file error!"));
                    }
                });
                fr.onloadend = () => {
                    fr.onloadend = fr.onload = fr.onerror = null;
                };
                fr.onerror = () => {
                    reject(new Error("Read file error!"));
                };
                fr.readAsArrayBuffer(block.blob);
            });
        }
        get({ isEmitEvent } = {}, racePromise = new Promise((res) => {
        })) {
            if (this.hash) {
                return Promise.resolve(this.hash);
            }
            if (!window.crypto.subtle) {
                const error = new Error('Crypto API Error: crypto.subtle is supposed to be undefined in insecure contexts');
                return Promise.reject(error);
            }
            const blocks = this.file.getBlocks();
            const blocksLength = blocks.length;
            let hashsLength = 0;
            return Promise.race([
                racePromise,
                Promise.all(blocks
                    .map(throat_1.default(Promise).apply(this, [this.concurrency, (block) => {
                        return this.loadNext(block).then(sha1 => {
                            hashsLength++;
                            this.process = parseFloat((hashsLength * 100 / blocksLength).toFixed(2));
                            isEmitEvent && this.emit(QETagNormal.Events.UpdateProgress, this.process);
                            return sha1;
                        });
                    }])))
                    .then((hashs) => __awaiter(this, void 0, void 0, function* () {
                    let perfex = Math.log2(this.file.blockSize);
                    const isSmallFile = hashs.length === 1;
                    let hash = null;
                    if (isSmallFile) {
                        hash = hashs[0];
                    }
                    else {
                        perfex = 0x80 | perfex;
                        hash = hashs.reduce((a, b) => utils_2.concatBuffer(a, b));
                        hash = yield window.crypto.subtle.digest('SHA-1', hash);
                    }
                    const byte = new ArrayBuffer(1);
                    const dv = new DataView(byte);
                    dv.setUint8(0, perfex);
                    hash = utils_2.concatBuffer(byte, hash);
                    hash = utils_2.arrayBufferToBase64(hash);
                    this.hash = utils_2.urlSafeBase64(hash) + this.file.size.toString(36);
                    return hash;
                }))
            ]);
        }
    }
    exports.default = QETagNormal;
});
define("qetag/worker", ["require", "exports", "qetag/base", "core/utils"], function (require, exports, base_2, utils_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    base_2 = __importDefault(base_2);
    class QETagWorker extends base_2.default {
        constructor(file, opts) {
            super(file);
            this.workers = opts.workers;
            this.channel = utils_3.guid();
        }
        get({ isTransferSupported, isEmitEvent } = {}, racePromise = new Promise((res) => {
        })) {
            if (this.hash) {
                return Promise.resolve(this.hash);
            }
            if (!window.crypto.subtle) {
                const error = new Error('Crypto API Error: crypto.subtle is supposed to be undefined in insecure contexts');
                return Promise.reject(error);
            }
            this.workers.removeMessagesByChannel(this.channel);
            this.workers.removeAllListeners(this.channel);
            return Promise.race([
                racePromise,
                new Promise((resolve, reject) => {
                    const blocks = this.file.getBlocks();
                    const blocksLength = blocks.length;
                    const hashs = [];
                    let hashsLength = 0;
                    this.workers.on(this.channel, (payload) => __awaiter(this, void 0, void 0, function* () {
                        if (payload.type === 'error') {
                            this.workers.removeAllListeners(this.channel);
                            reject(new Error(payload.data));
                        }
                        hashs[payload.data.index] = payload.data.sha1;
                        hashsLength++;
                        this.process = parseFloat((hashsLength * 100 / blocksLength).toFixed(2));
                        isEmitEvent && this.emit(QETagWorker.Events.UpdateProgress, this.process);
                        if (hashsLength === blocksLength) {
                            let perfex = Math.log2(this.file.blockSize);
                            const isSmallFile = hashsLength === 1;
                            let result = null;
                            if (isSmallFile) {
                                result = hashs[0];
                            }
                            else {
                                perfex = 0x80 | perfex;
                                result = hashs.reduce((a, b) => utils_3.concatBuffer(a, b));
                                result = yield window.crypto.subtle.digest('SHA-1', result);
                            }
                            const byte = new ArrayBuffer(1);
                            const dv = new DataView(byte);
                            dv.setUint8(0, perfex);
                            result = utils_3.concatBuffer(byte, result);
                            result = utils_3.arrayBufferToBase64(result);
                            this.hash = utils_3.urlSafeBase64(result) + this.file.size.toString(36);
                            this.workers.removeAllListeners(this.channel);
                            resolve(result);
                        }
                    }));
                    blocks.forEach((block) => {
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
                })
            ])
                .then(res => {
                if (res === 'race-to-stop') {
                    this.workers.removeMessagesByChannel(this.channel);
                }
                return res;
            });
        }
    }
    exports.default = QETagWorker;
});
define("qetag/index", ["require", "exports", "qetag/base", "qetag/normal", "qetag/worker"], function (require, exports, base_3, normal_1, worker_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    base_3 = __importDefault(base_3);
    normal_1 = __importDefault(normal_1);
    worker_1 = __importDefault(worker_1);
    exports.default = {
        Base: base_3.default,
        Normal: normal_1.default,
        Worker: worker_1.default
    };
});
define("http/base", ["require", "exports", "events"], function (require, exports, events_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class HttpClient extends events_2.EventEmitter {
        constructor() {
            super();
        }
    }
    exports.default = HttpClient;
    HttpClient.Events = {
        UpdateProgress: 'UpdateProgress'
    };
});
define("http/xhr", ["require", "exports", "core/utils", "http/base"], function (require, exports, utils_4, base_4) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    base_4 = __importDefault(base_4);
    class Http extends base_4.default {
        constructor(_) {
            super();
            this.channel = utils_4.guid();
        }
        post(props, { isEmitEvent } = {}) {
            return fetch(props.url, {
                body: props.data,
                method: 'POST',
                mode: 'cors',
                credentials: props.credentials,
                headers: Object.assign({}, (props.config
                    ? props.config.headers
                        ? props.config.headers
                        : {}
                    : {}))
            }).then(response => {
                return response.json();
            }).then(json => {
                isEmitEvent && this.emit(Http.Events.UpdateProgress, props.data.size);
                this.removeAllListeners(this.channel);
                return json;
            });
        }
    }
    exports.default = Http;
});
define("http/worker", ["require", "exports", "core/utils", "http/base"], function (require, exports, utils_5, base_5) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    base_5 = __importDefault(base_5);
    class HttpWorker extends base_5.default {
        constructor(opts) {
            super();
            this.workers = opts.workers;
            this.channel = utils_5.guid();
        }
        post(props, { isTransferSupported, isEmitEvent } = {}) {
            return new Promise((resolve, reject) => {
                const channel = utils_5.guid();
                this.workers.on(channel, (payload) => {
                    if (payload.type === 'error') {
                        this.workers.removeAllListeners(channel);
                        reject(payload.data);
                    }
                    if (payload.type === 'progress') {
                        isEmitEvent && this.emit('UpdateProgress', payload.data);
                    }
                    else {
                        this.workers.removeAllListeners(channel);
                        resolve(payload.data);
                    }
                });
                const opts = isTransferSupported ? {
                    transfer: [props.data]
                } : undefined;
                this.workers.send({
                    channel: channel,
                    payload: props,
                }, opts);
            });
        }
    }
    exports.default = HttpWorker;
});
define("http/index", ["require", "exports", "http/xhr", "http/worker", "http/base"], function (require, exports, xhr_1, worker_2, base_6) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    xhr_1 = __importDefault(xhr_1);
    worker_2 = __importDefault(worker_2);
    base_6 = __importDefault(base_6);
    exports.default = {
        Normal: xhr_1.default,
        Worker: worker_2.default,
        Base: base_6.default
    };
});
define("worker/index", ["require", "exports", "events"], function (require, exports, events_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class WorkerProvider extends events_3.EventEmitter {
        constructor(workerPath, taskConcurrency = 1) {
            super();
            this.workers = [];
            this.messages = [];
            this.cpus = window.navigator.hardwareConcurrency || 1;
            this.taskConcurrency = taskConcurrency;
            for (let i = 0; i < this.cpus; i++) {
                const worker = {
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
        static isTransferablesSupported() {
            return (() => {
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
                }
                catch (e) {
                }
                return !Boolean(buffer.byteLength);
            })();
        }
        static asyncFnMover(fn) {
            const blob = new Blob([`
            $$=${fn.toString()};
            onmessage=function (e) {
                $$(e.data).then(
                        function (res) {
                            var payload = {
                                data: res,
                                type: 'data'
                            };
                            postMessage({
                                channel: e.data.channel,
                                payload: payload
                            });
                        },
                        function (res) {
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
                        }
                    )
            };
        `], {
                type: "text/javascript",
            });
            return URL.createObjectURL(blob);
        }
        onmessage(e) {
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
                const err = new Error(payload.data.message);
                err.stack = payload.data.stack;
                payload.data = err;
            }
            this.emit(channel, payload);
        }
        run() {
            const idles = this.workers.filter((worker) => !worker.buzy);
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
        send(message, options) {
            this.messages.push([message, options]);
            this.run();
        }
        destroy() {
            this.workers.forEach((worker) => {
                worker.instance.terminate();
            });
            this.workers = [];
            this.messages = [];
            this.removeAllListeners();
        }
        removeMessage(message) {
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
        removeMessagesByChannel(channel) {
            if (this.messages) {
                let index = 0;
                let element = this.messages[index];
                while (element) {
                    const message = element[0];
                    if (message.channel === channel) {
                        this.messages.splice(index, 1);
                    }
                    else {
                        index++;
                    }
                    element = this.messages[index];
                }
            }
        }
    }
    exports.default = WorkerProvider;
});
define("qetag/worker-script", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function handler(data) {
        const payload = data.payload;
        if (typeof FileReader === "undefined") {
            return Promise.reject(new Error('FileReaderAPI not support'));
        }
        return new Promise(function (resolve, reject) {
            const fr = new FileReader();
            fr.onload = function () {
                if (fr.result) {
                    self.crypto.subtle.digest('SHA-1', fr.result)
                        .then(sha1 => {
                        resolve({
                            sha1: sha1,
                            index: payload.index
                        });
                    });
                }
            };
            fr.onerror = function () {
                reject(new Error("Read file error"));
            };
            fr.readAsArrayBuffer(payload.blob);
        });
    }
    exports.default = handler;
});
define("http/worker-script", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function handler(data) {
        const payload = data.payload;
        const isBlob = Object.prototype.toString.call(payload.data) === '[object Blob]';
        return fetch(payload.url, {
            body: payload.data,
            method: 'POST',
            mode: 'cors',
            credentials: payload.credentials,
            headers: payload.config
                ? payload.config.headers
                    ? payload.config.headers
                    : {}
                : {}
        }).then(response => response.json())
            .then(response => {
            if (isBlob) {
                postMessage({
                    channel: data.channel,
                    payload: {
                        type: 'progress',
                        data: payload.data.size
                    }
                });
            }
            return response;
        });
    }
    exports.default = handler;
});
define("third-parts/merge", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = main;
    function main(...items) {
        return merge(...items);
    }
    exports.main = main;
    main.clone = clone;
    main.isPlainObject = isPlainObject;
    main.recursive = recursive;
    function merge(...items) {
        return _merge(items[0] === true, false, items);
    }
    exports.merge = merge;
    function recursive(...items) {
        return _merge(items[0] === true, true, items);
    }
    exports.recursive = recursive;
    function clone(input) {
        if (Array.isArray(input)) {
            const output = [];
            for (let index = 0; index < input.length; ++index)
                output.push(clone(input[index]));
            return output;
        }
        else if (isPlainObject(input)) {
            const output = {};
            for (const index in input)
                output[index] = clone(input[index]);
            return output;
        }
        else {
            return input;
        }
    }
    exports.clone = clone;
    function isPlainObject(input) {
        return input && typeof input === 'object' && !Array.isArray(input);
    }
    exports.isPlainObject = isPlainObject;
    function _recursiveMerge(base, extend) {
        if (!isPlainObject(base))
            return extend;
        for (const key in extend)
            base[key] = (isPlainObject(base[key]) && isPlainObject(extend[key])) ?
                _recursiveMerge(base[key], extend[key]) :
                extend[key];
        return base;
    }
    function _merge(isClone, isRecursive, items) {
        let result;
        if (isClone || !isPlainObject(result = items.shift()))
            result = {};
        for (let index = 0; index < items.length; ++index) {
            const item = items[index];
            if (!isPlainObject(item))
                continue;
            for (const key in item) {
                if (key === '__proto__')
                    continue;
                const value = isClone ? clone(item[key]) : item[key];
                result[key] = isRecursive ? _recursiveMerge(result[key], value) : value;
            }
        }
        return result;
    }
});
define("index", ["require", "exports", "core/file", "qetag/index", "http/index", "worker/index", "qetag/worker-script", "http/worker-script", "third-parts/merge", "core/utils"], function (require, exports, file_1, index_1, index_2, index_3, worker_script_1, worker_script_2, merge_1, utils_6) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    file_1 = __importDefault(file_1);
    index_1 = __importDefault(index_1);
    index_2 = __importDefault(index_2);
    index_3 = __importDefault(index_3);
    worker_script_1 = __importDefault(worker_script_1);
    worker_script_2 = __importDefault(worker_script_2);
    merge_1 = __importDefault(merge_1);
    var STATUS;
    (function (STATUS) {
        STATUS[STATUS["PENDING"] = 1] = "PENDING";
        STATUS[STATUS["PREPARING"] = 2] = "PREPARING";
        STATUS[STATUS["UPLOADING"] = 3] = "UPLOADING";
        STATUS[STATUS["CALCULATING"] = 4] = "CALCULATING";
        STATUS[STATUS["FAILED"] = 5] = "FAILED";
        STATUS[STATUS["DONE"] = 6] = "DONE";
        STATUS[STATUS["CANCEL"] = 7] = "CANCEL";
        STATUS[STATUS["PAUSE"] = 8] = "PAUSE";
    })(STATUS = exports.STATUS || (exports.STATUS = {}));
    exports.TASK_STATUS_INFO = {
        [STATUS.PENDING]: '排队中...',
        [STATUS.PREPARING]: '准备中...',
        [STATUS.UPLOADING]: '上传中...',
        [STATUS.CALCULATING]: '计算中...',
        [STATUS.FAILED]: '上传失败',
        [STATUS.DONE]: '上传完成',
        [STATUS.CANCEL]: '取消上传',
        [STATUS.PAUSE]: '暂停上传'
    };
    exports.UPLOADING_STATUS = {
        [STATUS.PREPARING]: 1,
        [STATUS.UPLOADING]: 1,
        [STATUS.CALCULATING]: 1
    };
    function sizeToStr(size) {
        if (size < 1024 * 1024) {
            return (size / 1024).toFixed(2) + 'KB';
        }
        if (size < 1024 * 1024 * 1024) {
            return (size / (1024 * 1024)).toFixed(2) + 'MB';
        }
        if (size < 1024 * 1024 * 1024 * 1024) {
            return (size / (1024 * 1024 * 1024)).toFixed(2) + 'GB';
        }
        return '';
    }
    let qetagWorkers;
    let uploaderWorkers;
    ;
    class WebFile {
        constructor(file, fileProps = {}, config = {}) {
            this.tryCount = 0;
            this.progress = 0;
            this.ctx = {
                length: 0
            };
            this.lastProgress = {
                time: null,
                size: 0
            };
            this.bytesPreSecond = 0;
            this.rate = '0KB/S';
            this.parent = '';
            this.error = [];
            this.hashCalcProgress = 0;
            this.status = STATUS.PENDING;
            this.tokenInfo = {
                uploadToken: "",
                createInfo: {},
                type: "",
                filePath: "",
                created: false,
                partUploadUrl: "https://upload-v1.6pan.cn",
                directUploadUrl: "https://upload-v1.6pan.cn/file/upload"
            };
            this.pos = [];
            this.props = fileProps;
            if (config.adapter) {
                if (!(config.adapter in index_1.default)) {
                    delete config.adapter;
                }
            }
            this.config = Object.assign({
                adapter: 'Normal',
                onStatusChange: function () { }
            }, config);
            this.file = new file_1.default({
                file,
                blockSize: WebFile.default.blockSize,
                chunkSize: WebFile.default.chunkSize
            });
            this.sizeStr = sizeToStr(this.file.size);
        }
        static config(config) {
            WebFile.default = merge_1.default(WebFile.default, config);
        }
        _qetag() {
            if (!this.qetag) {
                if (!qetagWorkers && this.config.adapter === 'Worker') {
                    qetagWorkers = new index_3.default(index_3.default.asyncFnMover(worker_script_1.default), WebFile.default.taskConcurrencyInWorkers);
                }
                this.qetag = new index_1.default[this.config.adapter](this.file, {
                    workers: qetagWorkers
                });
                this.qetag.on(index_1.default.Base.Events.UpdateProgress, (progress) => {
                    this.hashCalcProgress = progress;
                    this.config.onStatusChange(this, this.status);
                });
            }
            return this.qetag;
        }
        getHash(raceFunction) {
            const qetag = this._qetag();
            if (qetag.isExist()) {
                return Promise.resolve(qetag.getSync());
            }
            return qetag.get({
                isTransferablesSupported: index_3.default.isTransferablesSupported(),
                isEmitEvent: true
            }, raceFunction);
        }
        getHashSync() {
            const qetag = this._qetag();
            return qetag.getSync();
        }
        setHash(hash) {
            const qetag = this._qetag();
            qetag.set(hash);
        }
        get statusInfo() {
            return exports.TASK_STATUS_INFO[this.status];
        }
        isExisted() {
            if (this.normalFile) {
                return true;
            }
            return false;
        }
        _http() {
            if (!this.http) {
                if (!uploaderWorkers && this.config.adapter === 'Worker') {
                    uploaderWorkers = new index_3.default(index_3.default.asyncFnMover(worker_script_2.default), WebFile.default.taskConcurrencyInWorkers);
                }
                this.http = new index_2.default[this.config.adapter]({
                    workers: uploaderWorkers
                });
                const throttle = utils_6.createThrottle(1000);
                this.http.on(index_2.default.Base.Events.UpdateProgress, (bytes) => {
                    throttle(() => {
                        this.setProgress(bytes);
                    });
                });
            }
            return this.http;
        }
        _getDefaultRequestHeader() {
            const { AuthorizationTokenKey, AuthorizationStorageKey } = WebFile.default;
            const token = localStorage.getItem(AuthorizationStorageKey);
            if (token) {
                return {
                    headers: {
                        [AuthorizationTokenKey]: token
                    }
                };
            }
            return {};
        }
        getTokenInfo() {
            return __awaiter(this, void 0, void 0, function* () {
                const http = this._http();
                const params = {
                    hash: this.getHashSync(),
                    name: this.file.name,
                    op: this.props.op || 0
                };
                if (this.props.path) {
                    params.path = this.props.path;
                }
                if (this.props.parent) {
                    params.parent = this.props.parent;
                }
                const result = yield http.post({
                    url: WebFile.default.clientConfig.baseURL + WebFile.default.apis.token,
                    data: JSON.stringify(params),
                    credentials: 'include',
                    config: merge_1.default({}, WebFile.default.clientConfig, this._getDefaultRequestHeader())
                }).then(json => {
                    if (json.success === false) {
                        throw new Error(json.message);
                    }
                    return json;
                });
                return result;
            });
        }
        markTry(tryNum) {
            if (tryNum) {
                this.tryCount = tryNum;
            }
            else {
                this.tryCount++;
            }
        }
        setStatus(status) {
            this.status = status;
            const qetag = this._qetag();
            switch (status) {
                case STATUS.CALCULATING:
                    break;
                case STATUS.CANCEL:
                    if (this.http) {
                        this.http.removeAllListeners();
                    }
                    if (this.qetag) {
                        this.qetag.removeAllListeners();
                    }
                    qetag.emit('race-to-stop');
                    break;
                case STATUS.DONE:
                    this.progress = 100;
                    if (this.http) {
                        this.http.removeAllListeners();
                    }
                    if (this.qetag) {
                        this.qetag.removeAllListeners();
                    }
                    break;
                case STATUS.FAILED:
                    break;
                case STATUS.PAUSE:
                    this.tryCount = 0;
                    qetag.emit('race-to-stop');
                    break;
                case STATUS.PENDING:
                    this.tryCount = 0;
                    break;
                case STATUS.PREPARING:
                    break;
                case STATUS.UPLOADING:
                    break;
                default:
                    break;
            }
            this.config.onStatusChange(this, this.status);
        }
        getError() {
            return this.error;
        }
        setProgress(byte) {
            const now = new Date().getTime();
            const { chunkSize } = WebFile.default;
            const bytesUploading = Object.keys(this.ctx)
                .map(index => {
                const ctx = this.ctx[index];
                if (ctx && ctx.length) {
                    return ctx.length;
                }
                return 0;
            }).reduce((a, b) => a + b, 0);
            const bytesUploaded = bytesUploading * chunkSize;
            if (this.lastProgress.time) {
                this.bytesPreSecond = Math.floor((bytesUploaded - this.lastProgress.size) / ((now - this.lastProgress.time) / 1000));
                this.rate = sizeToStr(this.bytesPreSecond) + '/S';
            }
            this.lastProgress = {
                time: now,
                size: bytesUploaded
            };
            let progress = parseFloat((bytesUploaded * 100 / this.file.size).toFixed(2));
            if (progress > 100) {
                progress = 100;
            }
            this.progress = progress;
            if (this.bytesPreSecond >= 0 &&
                this.isUploading()) {
                this.setStatus(STATUS.UPLOADING);
            }
        }
        isUploading() {
            return this.status in exports.UPLOADING_STATUS;
        }
        isFailed() {
            return this.status === STATUS.FAILED;
        }
        isDone() {
            return this.status === STATUS.DONE;
        }
        isPending() {
            return this.status === STATUS.PENDING;
        }
        isTryout() {
            return this.tryCount > WebFile.default.chunkRetry;
        }
        isCancel() {
            return this.status === STATUS.CANCEL;
        }
        isCalculating() {
            return this.status === STATUS.CALCULATING;
        }
        isPreparing() {
            return this.status === STATUS.PREPARING;
        }
        isPaused() {
            return this.status === STATUS.PAUSE;
        }
        pause() {
            if (this.isUploading()) {
                this.setStatus(STATUS.PAUSE);
                return Promise.resolve();
            }
            return Promise.reject(new Error(`Warning: Non-uploading`));
        }
        resume() {
            if (this.isFailed()) {
                this.restTryCount();
                return this.upload();
            }
            if (this.isPaused()) {
                return this.upload();
            }
            if (this.isCancel()) {
                return Promise.reject(new Error(`Error: Uploader destoryed`));
            }
            return Promise.reject(new Error(`Warning: Uploading`));
        }
        restTryCount() {
            this.tryCount = 0;
        }
        cancel() {
            this.setStatus(STATUS.CANCEL);
            return Promise.resolve();
        }
        setFileInfo(info) {
            if (info.created) {
                this.setNormalFile(info.createInfo);
            }
            else {
                this.tokenInfo = info;
            }
        }
        upload() {
            return __awaiter(this, void 0, void 0, function* () {
                if (this.isUploading()) {
                    throw new Error(`Warning: Uploading`);
                }
                try {
                    this.setStatus(STATUS.CALCULATING);
                    const qetag = this._qetag();
                    qetag.removeAllListeners('race-to-stop');
                    let resolveRefs;
                    qetag.on('race-to-stop', () => {
                        resolveRefs && resolveRefs('race-to-stop');
                    });
                    yield this.getHash(new Promise((resolve) => {
                        resolveRefs = resolve;
                    }));
                    if (qetag.getSync() === 'race-to-stop') {
                        qetag.set('');
                        return;
                    }
                    this.setStatus(STATUS.PREPARING);
                    const result = yield this.getTokenInfo();
                    this.setFileInfo(result);
                    if (this.isExisted()) {
                        this.setStatus(STATUS.DONE);
                        return;
                    }
                    if (this.isCancel()) {
                        throw new Error(`Warning: Cancel upload`);
                    }
                    this.setStatus(STATUS.UPLOADING);
                    this.start();
                }
                catch (e) {
                    this.recordError(e);
                    this.setStatus(STATUS.FAILED);
                }
            });
        }
        recordError(e) {
            this.error.push(e);
        }
        start() {
            return __awaiter(this, void 0, void 0, function* () {
                if (this.isDone()) {
                    return;
                }
                if (this.isPaused()) {
                    return;
                }
                try {
                    if (this.isCancel()) {
                        throw new Error(`Warning: Cancel upload`);
                    }
                    if (this.isTryout()) {
                        throw new Error(`Warning: Upload Tryout`);
                    }
                }
                catch (e) {
                    this.recordError(e);
                    this.setStatus(STATUS.FAILED);
                    return;
                }
                try {
                    if (this.ctx.length === this.file.getBlocks().length) {
                        const data = yield this.createFile();
                        if (data.code) {
                            throw new Error(`Create: ${data.message}`);
                        }
                        const res = JSON.parse(data.response);
                        if (res.hash !== this.getHashSync()) {
                            throw new Error(`Warning: File check failed`);
                        }
                        this.setNormalFile(res);
                        this.setStatus(STATUS.DONE);
                        return;
                    }
                    this.setPos();
                    this.pos.filter(p => p.status === STATUS.PENDING).map(v => {
                        v.status = STATUS.UPLOADING;
                        this.blockStart(v);
                    });
                }
                catch (e) {
                    this.recordError(e);
                    this.markTry();
                    this.start();
                    return;
                }
            });
        }
        setNormalFile(file) {
            this.normalFile = file;
        }
        createFile() {
            const http = this._http();
            const { clientConfig, apis } = WebFile.default;
            return http.post({
                url: this.tokenInfo.partUploadUrl + apis.mkfile + this.file.size,
                data: Array.from(this.ctx).map(ctx => ctx[ctx.length - 1]).toString(),
                credentials: 'omit',
                config: merge_1.default({}, clientConfig, {
                    baseURL: this.tokenInfo.partUploadUrl,
                    headers: {
                        'Authorization': this.tokenInfo.uploadToken,
                        'UploadBatch': this.file.batch,
                        'Content-Type': 'text/plain;charset=UTF-8'
                    }
                })
            });
        }
        setPos() {
            let pos = Math.max.apply(null, this.pos.length ? this.pos.map(p => p.index) : [-1]);
            this.pos = this.pos.filter((pos) => pos.status !== STATUS.DONE);
            let len = WebFile.default.concurrency - this.pos.length;
            if (len < 0) {
                len = 0;
            }
            while (len) {
                pos++;
                if (this.file.getBlockByIndex(pos)) {
                    this.pos.push({
                        index: pos,
                        status: STATUS.PENDING
                    });
                }
                len--;
            }
        }
        _orderTask(chunks) {
            let promise = Promise.resolve();
            for (let i = 0; i < chunks.length; i++) {
                const chunk = chunks[i];
                promise = promise
                    .then((ctx) => this.chunkUpload(chunk, ctx))
                    .then((res) => {
                    if (res.code) {
                        throw new Error(`Chunk: ${res.message}`);
                    }
                    this.setCtx(res.ctx, chunk);
                    return res.ctx;
                });
            }
            return promise;
        }
        blockStart(info) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    const block = this.file.getBlockByIndex(info.index);
                    const chunks = block.getChunks();
                    yield this._orderTask(chunks);
                    info.status = STATUS.DONE;
                    this.start();
                }
                catch (e) {
                    info.status = STATUS.PENDING;
                    this.recordError(e);
                    this.removeCtx(info.index);
                    this.markTry();
                    this.start();
                }
            });
        }
        removeCtx(index) {
            delete this.ctx[index];
        }
        setCtx(ctx, chunk) {
            if (chunk.index === 0) {
                this.ctx[chunk.block.index] = [];
            }
            this.ctx[chunk.block.index][chunk.index] = ctx;
            if (this.ctx[chunk.block.index].length === chunk.block.getChunks().length) {
                this.ctx.length += 1;
            }
        }
        chunkUpload(chunk, ctx) {
            const http = this._http();
            const { clientConfig, apis } = WebFile.default;
            const config = {
                url: '',
                data: chunk.blob,
                credentials: 'omit',
                config: merge_1.default({}, clientConfig, {
                    baseURL: this.tokenInfo.partUploadUrl,
                    headers: {
                        'Authorization': this.tokenInfo.uploadToken,
                        'UploadBatch': this.file.batch,
                        'Content-Type': 'application/octet-stream'
                    }
                })
            };
            if (chunk.index === 0) {
                config.url = `${apis.mkblk}${chunk.block.size}/${chunk.block.index}`;
            }
            else {
                config.url = `${apis.bput}${ctx}/${chunk.startByte}`;
            }
            config.url = this.tokenInfo.partUploadUrl + config.url;
            return http.post(config, {
                isTransferablesSupported: index_3.default.isTransferablesSupported(),
                isEmitEvent: true
            });
        }
    }
    exports.WebFile = WebFile;
    WebFile.default = {
        clientConfig: {
            baseURL: 'https://api.6pan.cn',
            headers: {
                'Content-Type': 'application/json'
            }
        },
        apis: {
            token: '/v3/file/uploadToken',
            mkblk: '/mkblk/',
            bput: '/bput/',
            mkfile: '/mkfile/'
        },
        AuthorizationTokenKey: 'qingzhen-token',
        AuthorizationStorageKey: 'user-authorization-token',
        chunkRetry: 3,
        blockSize: 4 * 1024 * 1024,
        chunkSize: 1 * 1024 * 1024,
        concurrency: 3,
        taskConcurrencyInWorkers: 3,
    };
});
