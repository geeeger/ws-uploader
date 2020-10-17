var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
define("interface", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
define("core/utils", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.log = exports.sizeToStr = exports.createThrottle = exports.urlSafeBase64 = exports.arrayBufferToBase64 = exports.concatBuffer = exports.isObject = exports.isBlob = exports.guid = void 0;
    function guid() {
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
            var r = (Math.random() * 16) | 0;
            var v = c === "x" ? r : (r & 0x3) | 0x8;
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
        var tmp = new Uint8Array(buf1.byteLength + buf2.byteLength);
        tmp.set(new Uint8Array(buf1), 0);
        tmp.set(new Uint8Array(buf2), buf1.byteLength);
        return tmp.buffer;
    }
    exports.concatBuffer = concatBuffer;
    function arrayBufferToBase64(buffer) {
        var binary = '';
        var bytes = new Uint8Array(buffer);
        var len = bytes.byteLength;
        for (var i = 0; i < len; i++) {
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
        var timer = null;
        return function throttle(fn) {
            if (timer) {
                return;
            }
            timer = setTimeout(function () {
                fn();
                timer = null;
            }, time);
        };
    }
    exports.createThrottle = createThrottle;
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
    exports.sizeToStr = sizeToStr;
    function log(debug) {
        return function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            if (debug) {
                console.log.apply(null, args);
            }
        };
    }
    exports.log = log;
});
define("core/file", ["require", "exports", "core/block", "core/utils"], function (require, exports, block_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    block_1 = __importDefault(block_1);
    var rExt = /\.([^.]+)$/;
    var uid = 1;
    var QZFile = (function () {
        function QZFile(_a) {
            var file = _a.file, blockSize = _a.blockSize, chunkSize = _a.chunkSize, batch = _a.batch;
            this.file = file;
            this.blockSize = blockSize || 4 * 1024 * 1024;
            this.batch = batch || utils_1.guid();
            this.size = file.size;
            this.name = file.name || "unknown_" + uid++;
            this.lastModified = file.lastModified || new Date().getTime();
            this.blocks = [];
            this.chunkSize = chunkSize || 1 * 1024 * 1024;
            var ext = rExt.exec(file.name) ? RegExp.$1.toLowerCase() : "";
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
        QZFile.prototype.slice = function (start, end) {
            var file = this.file;
            var slice = file.slice;
            return slice.call(file, start, end);
        };
        QZFile.prototype.getBlocks = function () {
            if (this.blocks.length) {
                return this.blocks;
            }
            var startByte = 0;
            var blocks = [];
            while (startByte < this.size) {
                var endByte = startByte + this.blockSize;
                if (endByte > this.size) {
                    endByte = this.size;
                }
                blocks.push(new block_1.default(this, startByte, endByte));
                startByte += this.blockSize;
            }
            this.blocks = blocks;
            return blocks;
        };
        QZFile.prototype.getBlockByIndex = function (index) {
            return this.getBlocks()[index];
        };
        QZFile.prototype.getChunksSize = function () {
            return this.getBlocks().map(function (block) { return block.getChunks().length; }).reduce(function (a, b) { return a + b; }, 0);
        };
        return QZFile;
    }());
    exports.default = QZFile;
});
define("core/block", ["require", "exports", "core/chunk"], function (require, exports, chunk_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    chunk_1 = __importDefault(chunk_1);
    var Block = (function () {
        function Block(file, startByte, endByte) {
            this.file = file;
            this.startByte = startByte;
            this.endByte = endByte;
            this.chunks = [];
        }
        Block.prototype.getChunks = function () {
            if (this.chunks.length) {
                return this.chunks;
            }
            var startByte = 0;
            var chunks = [];
            while (startByte < this.size) {
                var endByte = startByte + this.file.chunkSize;
                if (endByte > this.size) {
                    endByte = this.size;
                }
                chunks.push(new chunk_1.default(this, startByte, endByte));
                startByte += this.file.chunkSize;
            }
            this.chunks = chunks;
            return chunks;
        };
        Block.prototype.getChunkByIndex = function (index) {
            return this.getChunks()[index];
        };
        Object.defineProperty(Block.prototype, "size", {
            get: function () {
                return this.endByte - this.startByte;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Block.prototype, "index", {
            get: function () {
                return Math.round(this.startByte / this.file.blockSize);
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Block.prototype, "blob", {
            get: function () {
                return this.file.slice(this.startByte, this.endByte);
            },
            enumerable: false,
            configurable: true
        });
        return Block;
    }());
    exports.default = Block;
});
define("core/chunk", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Chunk = (function () {
        function Chunk(block, startByte, endByte) {
            this.block = block;
            this.startByte = startByte;
            this.endByte = endByte;
        }
        Object.defineProperty(Chunk.prototype, "size", {
            get: function () {
                return this.endByte - this.startByte;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Chunk.prototype, "index", {
            get: function () {
                return Math.floor(this.startByte / this.block.file.chunkSize);
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Chunk.prototype, "blob", {
            get: function () {
                var block = this.block;
                var file = block.file;
                var offset = block.index * file.blockSize;
                return file.slice(offset + this.startByte, offset + this.endByte);
            },
            enumerable: false,
            configurable: true
        });
        return Chunk;
    }());
    exports.default = Chunk;
});
define("constants/status", ["require", "exports"], function (require, exports) {
    "use strict";
    var _a, _b;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.UPLOADING_STATUS = exports.TASK_STATUS_INFO = exports.STATUS = void 0;
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
    exports.TASK_STATUS_INFO = (_a = {},
        _a[STATUS.PENDING] = '排队中...',
        _a[STATUS.PREPARING] = '准备中...',
        _a[STATUS.UPLOADING] = '上传中...',
        _a[STATUS.CALCULATING] = '计算中...',
        _a[STATUS.FAILED] = '上传失败',
        _a[STATUS.DONE] = '上传完成',
        _a[STATUS.CANCEL] = '取消上传',
        _a[STATUS.PAUSE] = '暂停上传',
        _a);
    exports.UPLOADING_STATUS = (_b = {},
        _b[STATUS.PREPARING] = 1,
        _b[STATUS.UPLOADING] = 1,
        _b[STATUS.CALCULATING] = 1,
        _b);
});
define("constants/uploader-config", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.UploaderConfig = void 0;
    exports.UploaderConfig = {
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
define("third-parts/merge", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.isPlainObject = exports.clone = exports.recursive = exports.merge = exports.main = void 0;
    exports.default = main;
    function main() {
        var items = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            items[_i] = arguments[_i];
        }
        return merge.apply(void 0, items);
    }
    exports.main = main;
    main.clone = clone;
    main.isPlainObject = isPlainObject;
    main.recursive = recursive;
    function merge() {
        var items = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            items[_i] = arguments[_i];
        }
        return _merge(items[0] === true, false, items);
    }
    exports.merge = merge;
    function recursive() {
        var items = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            items[_i] = arguments[_i];
        }
        return _merge(items[0] === true, true, items);
    }
    exports.recursive = recursive;
    function clone(input) {
        if (Array.isArray(input)) {
            var output = [];
            for (var index = 0; index < input.length; ++index)
                output.push(clone(input[index]));
            return output;
        }
        else if (isPlainObject(input)) {
            var output = {};
            for (var index in input)
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
        for (var key in extend)
            base[key] = (isPlainObject(base[key]) && isPlainObject(extend[key])) ?
                _recursiveMerge(base[key], extend[key]) :
                extend[key];
        return base;
    }
    function _merge(isClone, isRecursive, items) {
        var result;
        if (isClone || !isPlainObject(result = items.shift()))
            result = {};
        for (var index = 0; index < items.length; ++index) {
            var item = items[index];
            if (!isPlainObject(item))
                continue;
            for (var key in item) {
                if (key === '__proto__')
                    continue;
                var value = isClone ? clone(item[key]) : item[key];
                result[key] = isRecursive ? _recursiveMerge(result[key], value) : value;
            }
        }
        return result;
    }
});
define("core/base", ["require", "exports", "constants/uploader-config", "third-parts/merge"], function (require, exports, uploader_config_1, merge_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Base = (function () {
        function Base() {
        }
        Base.config = function (config) {
            Base.default = merge_1.merge(Base.default, config);
        };
        Base.default = uploader_config_1.UploaderConfig;
        return Base;
    }());
    exports.default = Base;
});
define("core/status", ["require", "exports", "constants/status", "core/base", "constants/status"], function (require, exports, status_1, base_1, status_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.UPLOADING_STATUS = exports.TASK_STATUS_INFO = exports.STATUS = void 0;
    base_1 = __importDefault(base_1);
    Object.defineProperty(exports, "STATUS", { enumerable: true, get: function () { return status_2.STATUS; } });
    Object.defineProperty(exports, "TASK_STATUS_INFO", { enumerable: true, get: function () { return status_2.TASK_STATUS_INFO; } });
    Object.defineProperty(exports, "UPLOADING_STATUS", { enumerable: true, get: function () { return status_2.UPLOADING_STATUS; } });
    var Status = (function (_super) {
        __extends(Status, _super);
        function Status() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.status = status_1.STATUS.PENDING;
            _this._statusHandlers = {};
            _this.tryCount = 0;
            _this.error = [];
            return _this;
        }
        Object.defineProperty(Status.prototype, "statusInfo", {
            get: function () {
                return status_1.TASK_STATUS_INFO[this.status];
            },
            enumerable: false,
            configurable: true
        });
        Status.prototype.restTryCount = function () {
            this.tryCount = 0;
        };
        Status.prototype.getError = function () {
            return this.error;
        };
        Status.prototype.recordError = function (e) {
            this.error.push(e);
        };
        Status.prototype.markTry = function (tryNum) {
            if (tryNum) {
                this.tryCount = tryNum;
            }
            else {
                this.tryCount++;
            }
        };
        Status.prototype.addStatusHandler = function (status, handler) {
            this._statusHandlers[status] = handler;
            return this;
        };
        Status.prototype.setStatus = function (status) {
            this.status = status;
            var handler = this._statusHandlers[status];
            if (handler) {
                handler();
            }
        };
        Status.prototype.isUploading = function () {
            return this.status in status_1.UPLOADING_STATUS;
        };
        Status.prototype.isFailed = function () {
            return this.status === status_1.STATUS.FAILED;
        };
        Status.prototype.isTryout = function () {
            return this.tryCount > base_1.default.default.chunkRetry;
        };
        Status.prototype.isDone = function () {
            return this.status === status_1.STATUS.DONE;
        };
        Status.prototype.isPending = function () {
            return this.status === status_1.STATUS.PENDING;
        };
        Status.prototype.isCancel = function () {
            return this.status === status_1.STATUS.CANCEL;
        };
        Status.prototype.isCalculating = function () {
            return this.status === status_1.STATUS.CALCULATING;
        };
        Status.prototype.isPreparing = function () {
            return this.status === status_1.STATUS.PREPARING;
        };
        Status.prototype.isPaused = function () {
            return this.status === status_1.STATUS.PAUSE;
        };
        return Status;
    }(base_1.default));
    exports.default = Status;
});
define("http/base", ["require", "exports", "events"], function (require, exports, events_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var HttpClient = (function (_super) {
        __extends(HttpClient, _super);
        function HttpClient() {
            return _super.call(this) || this;
        }
        HttpClient.Events = {
            UpdateProgress: 'UpdateProgress'
        };
        return HttpClient;
    }(events_1.EventEmitter));
    exports.default = HttpClient;
});
define("http/xhr", ["require", "exports", "core/utils", "http/base"], function (require, exports, utils_2, base_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    base_2 = __importDefault(base_2);
    var Http = (function (_super) {
        __extends(Http, _super);
        function Http(_) {
            var _this = _super.call(this) || this;
            _this.channel = utils_2.guid();
            return _this;
        }
        Http.prototype.post = function (props, _a) {
            var _this = this;
            var isEmitEvent = (_a === void 0 ? {} : _a).isEmitEvent;
            return fetch(props.url, {
                body: props.data,
                method: 'POST',
                mode: 'cors',
                credentials: props.credentials,
                headers: __assign({}, (props.config
                    ? props.config.headers
                        ? props.config.headers
                        : {}
                    : {}))
            }).then(function (response) {
                return response.json();
            }).then(function (json) {
                isEmitEvent && _this.emit(Http.Events.UpdateProgress, props.data.size);
                _this.removeAllListeners(_this.channel);
                return json;
            });
        };
        return Http;
    }(base_2.default));
    exports.default = Http;
});
define("http/worker", ["require", "exports", "core/utils", "http/base"], function (require, exports, utils_3, base_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    base_3 = __importDefault(base_3);
    var HttpWorker = (function (_super) {
        __extends(HttpWorker, _super);
        function HttpWorker(opts) {
            var _this = _super.call(this) || this;
            _this.workers = opts.workers;
            _this.channel = utils_3.guid();
            return _this;
        }
        HttpWorker.prototype.post = function (props, _a) {
            var _this = this;
            var _b = _a === void 0 ? {} : _a, isTransferSupported = _b.isTransferSupported, isEmitEvent = _b.isEmitEvent;
            return new Promise(function (resolve, reject) {
                var channel = utils_3.guid();
                _this.workers.on(channel, function (payload) {
                    if (payload.type === 'error') {
                        _this.workers.removeAllListeners(channel);
                        reject(payload.data);
                    }
                    if (payload.type === 'progress') {
                        isEmitEvent && _this.emit('UpdateProgress', payload.data);
                    }
                    else {
                        _this.workers.removeAllListeners(channel);
                        resolve(payload.data);
                    }
                });
                var opts = isTransferSupported ? {
                    transfer: [props.data]
                } : undefined;
                _this.workers.send({
                    channel: channel,
                    payload: props,
                }, opts);
            });
        };
        return HttpWorker;
    }(base_3.default));
    exports.default = HttpWorker;
});
define("qetag/base", ["require", "exports", "events"], function (require, exports, events_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var QETagBase = (function (_super) {
        __extends(QETagBase, _super);
        function QETagBase(file) {
            var _this = _super.call(this) || this;
            _this.file = file;
            _this.hash = "";
            _this.process = 0;
            return _this;
        }
        QETagBase.prototype.set = function (hash) {
            this.hash = hash;
        };
        QETagBase.prototype.getSync = function () {
            return this.hash;
        };
        QETagBase.prototype.isExist = function () {
            return Boolean(this.hash);
        };
        QETagBase.Events = {
            UpdateProgress: 'UpdateProgress'
        };
        return QETagBase;
    }(events_2.EventEmitter));
    exports.default = QETagBase;
});
define("third-parts/throat", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Delayed = (function () {
        function Delayed(resolve, fn, self, args) {
            this.resolve = resolve;
            this.fn = fn;
            this.self = self || null;
            this.args = args;
        }
        return Delayed;
    }());
    var Queue = (function () {
        function Queue() {
            this._s1 = [];
            this._s2 = [];
        }
        Queue.prototype.push = function (value) {
            this._s1.push(value);
        };
        Queue.prototype.shift = function () {
            var s2 = this._s2;
            if (s2.length === 0) {
                var s1 = this._s1;
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
        return Queue;
    }());
    function throat() {
        function throat(size, fn) {
            var queue = new Queue();
            function run(fn, self, args) {
                if (size) {
                    size--;
                    var result = new Promise(function (resolve) {
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
                    var next = queue.shift();
                    next.resolve(run(next.fn, next.self, next.args));
                }
            }
            if (typeof size === 'function') {
                var temp = fn;
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
                    var args = [];
                    for (var i = 0; i < arguments.length; i++) {
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
                    var args = [];
                    for (var i = 1; i < arguments.length; i++) {
                        args.push(arguments[i]);
                    }
                    return run(fn, this, args);
                };
            }
        }
        return throat;
    }
    exports.default = throat;
});
define("qetag/normal", ["require", "exports", "third-parts/throat", "qetag/base", "core/utils"], function (require, exports, throat_1, base_4, utils_4) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    throat_1 = __importDefault(throat_1);
    base_4 = __importDefault(base_4);
    var QETagNormal = (function (_super) {
        __extends(QETagNormal, _super);
        function QETagNormal(file, _) {
            var _this = _super.call(this, file) || this;
            _this.concurrency = window.navigator.hardwareConcurrency || 1;
            return _this;
        }
        QETagNormal.prototype.loadNext = function (block) {
            var _this = this;
            return new Promise(function (resolve, reject) {
                var fr = new FileReader();
                fr.onload = function () { return __awaiter(_this, void 0, void 0, function () {
                    var sha1;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                if (!fr.result) return [3, 2];
                                return [4, crypto.subtle.digest('SHA-1', fr.result)];
                            case 1:
                                sha1 = _a.sent();
                                resolve(sha1);
                                return [3, 3];
                            case 2:
                                reject(new Error("Read file error!"));
                                _a.label = 3;
                            case 3: return [2];
                        }
                    });
                }); };
                fr.onloadend = function () {
                    fr.onloadend = fr.onload = fr.onerror = null;
                };
                fr.onerror = function () {
                    reject(new Error("Read file error!"));
                };
                fr.readAsArrayBuffer(block.blob);
            });
        };
        QETagNormal.prototype.get = function (_a, racePromise) {
            var _this = this;
            var isEmitEvent = (_a === void 0 ? {} : _a).isEmitEvent;
            if (racePromise === void 0) { racePromise = new Promise(function (res) {
            }); }
            if (this.hash) {
                return Promise.resolve(this.hash);
            }
            if (typeof crypto === 'undefined') {
                var error = new Error('Crypto API Error: crypto is not support');
                return Promise.reject(error);
            }
            if (!crypto.subtle) {
                var error = new Error('Crypto API Error: crypto.subtle is supposed to be undefined in insecure contexts');
                return Promise.reject(error);
            }
            var blocks = this.file.getBlocks();
            var blocksLength = blocks.length;
            var hashsLength = 0;
            return Promise.race([
                racePromise,
                Promise.all(blocks
                    .map(throat_1.default().apply(this, [this.concurrency, function (block) {
                        return Promise.race([
                            racePromise.then(function () {
                                throw new Error('Racing interrupted');
                            }),
                            _this.loadNext(block)
                        ]).then(function (sha1) {
                            hashsLength++;
                            _this.process = parseFloat((hashsLength * 100 / blocksLength).toFixed(2));
                            isEmitEvent && _this.emit(QETagNormal.Events.UpdateProgress, _this.process);
                            return sha1;
                        });
                    }])))
                    .then(function (hashs) { return __awaiter(_this, void 0, void 0, function () {
                    var perfex, isSmallFile, hash, byte, dv, calcedhash;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                perfex = Math.log2(this.file.blockSize);
                                isSmallFile = hashs.length === 1;
                                hash = null;
                                if (!isSmallFile) return [3, 1];
                                hash = hashs[0];
                                return [3, 3];
                            case 1:
                                perfex = 0x80 | perfex;
                                hash = hashs.reduce(function (a, b) { return utils_4.concatBuffer(a, b); });
                                return [4, crypto.subtle.digest('SHA-1', hash)];
                            case 2:
                                hash = _a.sent();
                                _a.label = 3;
                            case 3:
                                byte = new ArrayBuffer(1);
                                dv = new DataView(byte);
                                dv.setUint8(0, perfex);
                                hash = utils_4.concatBuffer(byte, hash);
                                hash = utils_4.arrayBufferToBase64(hash);
                                calcedhash = utils_4.urlSafeBase64(hash) + this.file.size.toString(36);
                                return [2, calcedhash];
                        }
                    });
                }); })
            ])
                .then(function (res) {
                _this.hash = res;
                return res;
            });
        };
        return QETagNormal;
    }(base_4.default));
    exports.default = QETagNormal;
});
define("qetag/worker", ["require", "exports", "qetag/base", "core/utils"], function (require, exports, base_5, utils_5) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    base_5 = __importDefault(base_5);
    var QETagWorker = (function (_super) {
        __extends(QETagWorker, _super);
        function QETagWorker(file, opts) {
            var _this = _super.call(this, file) || this;
            _this.workers = opts.workers;
            _this.channel = utils_5.guid();
            return _this;
        }
        QETagWorker.prototype.get = function (_a, racePromise) {
            var _this = this;
            var _b = _a === void 0 ? {} : _a, isTransferSupported = _b.isTransferSupported, isEmitEvent = _b.isEmitEvent;
            if (racePromise === void 0) { racePromise = new Promise(function (res) {
            }); }
            if (this.hash) {
                return Promise.resolve(this.hash);
            }
            if (typeof crypto === 'undefined') {
                var error = new Error('Crypto API Error: crypto is not support');
                return Promise.reject(error);
            }
            if (!crypto.subtle) {
                var error = new Error('Crypto API Error: crypto.subtle is supposed to be undefined in insecure contexts');
                return Promise.reject(error);
            }
            this.workers.removeMessagesByChannel(this.channel);
            this.workers.removeAllListeners(this.channel);
            return Promise.race([
                racePromise,
                new Promise(function (resolve, reject) {
                    var blocks = _this.file.getBlocks();
                    var blocksLength = blocks.length;
                    var hashs = [];
                    var hashsLength = 0;
                    _this.workers.on(_this.channel, function (payload) { return __awaiter(_this, void 0, void 0, function () {
                        var perfex, isSmallFile, result, byte, dv, calcedhash;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    if (payload.type === 'error') {
                                        this.workers.removeAllListeners(this.channel);
                                        reject(new Error(payload.data));
                                    }
                                    hashs[payload.data.index] = payload.data.sha1;
                                    hashsLength++;
                                    this.process = parseFloat((hashsLength * 100 / blocksLength).toFixed(2));
                                    isEmitEvent && this.emit(QETagWorker.Events.UpdateProgress, this.process);
                                    if (!(hashsLength === blocksLength)) return [3, 4];
                                    perfex = Math.log2(this.file.blockSize);
                                    isSmallFile = hashsLength === 1;
                                    result = null;
                                    if (!isSmallFile) return [3, 1];
                                    result = hashs[0];
                                    return [3, 3];
                                case 1:
                                    perfex = 0x80 | perfex;
                                    result = hashs.reduce(function (a, b) { return utils_5.concatBuffer(a, b); });
                                    return [4, crypto.subtle.digest('SHA-1', result)];
                                case 2:
                                    result = _a.sent();
                                    _a.label = 3;
                                case 3:
                                    byte = new ArrayBuffer(1);
                                    dv = new DataView(byte);
                                    dv.setUint8(0, perfex);
                                    result = utils_5.concatBuffer(byte, result);
                                    result = utils_5.arrayBufferToBase64(result);
                                    calcedhash = utils_5.urlSafeBase64(result) + this.file.size.toString(36);
                                    this.workers.removeAllListeners(this.channel);
                                    resolve(calcedhash);
                                    _a.label = 4;
                                case 4: return [2];
                            }
                        });
                    }); });
                    blocks.forEach(function (block) {
                        var opts = isTransferSupported ? {
                            transfer: [block.blob]
                        } : undefined;
                        _this.workers.send({
                            channel: _this.channel,
                            payload: {
                                blob: block.blob,
                                index: block.index,
                            },
                        }, opts);
                    });
                })
            ])
                .then(function (res) {
                if (res === 'race-to-stop') {
                    _this.workers.removeMessagesByChannel(_this.channel);
                }
                _this.hash = res;
                return res;
            });
        };
        return QETagWorker;
    }(base_5.default));
    exports.default = QETagWorker;
});
define("qetag/index", ["require", "exports", "qetag/base", "qetag/normal", "qetag/worker"], function (require, exports, base_6, normal_1, worker_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    base_6 = __importDefault(base_6);
    normal_1 = __importDefault(normal_1);
    worker_1 = __importDefault(worker_1);
    exports.default = {
        Base: base_6.default,
        Normal: normal_1.default,
        Worker: worker_1.default
    };
});
define("worker/index", ["require", "exports", "events"], function (require, exports, events_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var WorkerProvider = (function (_super) {
        __extends(WorkerProvider, _super);
        function WorkerProvider(workerPath, taskConcurrency) {
            if (taskConcurrency === void 0) { taskConcurrency = 1; }
            var _this = _super.call(this) || this;
            _this.workers = [];
            _this.messages = [];
            _this.cpus = window.navigator.hardwareConcurrency || 1;
            _this.taskConcurrency = taskConcurrency;
            for (var i = 0; i < _this.cpus; i++) {
                var worker = {
                    buzy: false,
                    instance: new Worker(workerPath),
                    tasks: 0
                };
                _this.workers.push(worker);
            }
            for (var i = 0; i < _this.cpus; i++) {
                _this.workers[i].instance.onmessage = _this.onmessage.bind(_this);
            }
            return _this;
        }
        WorkerProvider.isTransferablesSupported = function () {
            return (function () {
                var buffer = new ArrayBuffer(1);
                try {
                    var blob = new Blob([""], {
                        type: "text/javascript",
                    });
                    var urlObj = URL.createObjectURL(blob);
                    var worker = new Worker(urlObj);
                    worker.postMessage(buffer, [
                        buffer,
                    ]);
                    worker.terminate();
                }
                catch (e) {
                }
                return !Boolean(buffer.byteLength);
            })();
        };
        WorkerProvider.asyncFnMover = function (fn) {
            var blob = new Blob(["\n            $$=" + fn.toString() + ";\n            onmessage=function (e) {\n                $$(e.data)\n                    .then(function (res) {\n                        var payload = {\n                            data: res,\n                            type: 'data'\n                        };\n                        postMessage({\n                            channel: e.data.channel,\n                            payload: payload\n                        });\n                    })\n                    .catch(function (res) {\n                        postMessage({\n                            channel: e.data.channel,\n                            payload: {\n                                type: 'error',\n                                data: {\n                                    message: res.message,\n                                    stack: res.stack\n                                }\n                            }\n                        });\n                    })\n            };\n        "], {
                type: "text/javascript",
            });
            return URL.createObjectURL(blob);
        };
        WorkerProvider.prototype.onmessage = function (e) {
            for (var i = 0; i < this.cpus; i++) {
                var worker = this.workers[i];
                if (e.target === worker.instance) {
                    worker.buzy = false;
                    worker.tasks--;
                    this.run();
                }
            }
            var _a = e.data, channel = _a.channel, payload = _a.payload;
            if (payload.type === 'error') {
                var err = new Error(payload.data.message);
                err.stack = payload.data.stack;
                payload.data = err;
            }
            this.emit(channel, payload);
        };
        WorkerProvider.prototype.run = function () {
            var idles = this.workers.filter(function (worker) { return !worker.buzy; });
            for (var i = this.messages.length - 1; i >= 0; i--) {
                var idleWorker = idles.pop();
                if (!idleWorker) {
                    break;
                }
                var message = this.messages.pop();
                if (!message) {
                    break;
                }
                idleWorker.tasks++;
                if (idleWorker.tasks >= this.taskConcurrency) {
                    idleWorker.buzy = true;
                }
                idleWorker.instance.postMessage.apply(idleWorker.instance, message);
            }
        };
        WorkerProvider.prototype.send = function (message, options) {
            this.messages.push([message, options]);
            this.run();
        };
        WorkerProvider.prototype.destroy = function () {
            this.workers.forEach(function (worker) {
                worker.instance.terminate();
            });
            this.workers = [];
            this.messages = [];
            this.removeAllListeners();
        };
        WorkerProvider.prototype.removeMessage = function (message) {
            if (this.messages) {
                for (var index = 0; index < this.messages.length; index++) {
                    var element = this.messages[index][0];
                    if (element === message) {
                        this.messages.splice(index, 1);
                        break;
                    }
                }
            }
        };
        WorkerProvider.prototype.removeMessagesByChannel = function (channel) {
            if (this.messages) {
                var index = 0;
                var element = this.messages[index];
                while (element) {
                    var message = element[0];
                    if (message.channel === channel) {
                        this.messages.splice(index, 1);
                    }
                    else {
                        index++;
                    }
                    element = this.messages[index];
                }
            }
        };
        return WorkerProvider;
    }(events_3.EventEmitter));
    exports.default = WorkerProvider;
});
define("qetag/worker-script", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function handler(data) {
        return new Promise(function (resolve, reject) {
            var payload = data.payload;
            if (typeof FileReader === "undefined") {
                reject(new Error('FileReaderAPI not support in WebWorkers'));
            }
            var fr = new FileReader();
            fr.onload = function () {
                if (fr.result) {
                    if (typeof crypto === 'undefined') {
                        reject(new Error('Crypto Api not support in WebWorkers'));
                    }
                    if (typeof crypto.subtle === 'undefined') {
                        reject(new Error('Crypto.Subtle Api not support in WebWorkers'));
                    }
                    crypto.subtle.digest('SHA-1', fr.result)
                        .then(function (sha1) {
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
        var payload = data.payload;
        var isBlob = Object.prototype.toString.call(payload.data) === '[object Blob]';
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
        }).then(function (response) { return response.json(); })
            .then(function (response) {
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
define("http/index", ["require", "exports", "http/xhr", "http/worker", "http/base"], function (require, exports, xhr_1, worker_2, base_7) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    xhr_1 = __importDefault(xhr_1);
    worker_2 = __importDefault(worker_2);
    base_7 = __importDefault(base_7);
    exports.default = {
        Normal: xhr_1.default,
        Worker: worker_2.default,
        Base: base_7.default
    };
});
define("core/ctx", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Ctx = (function () {
        function Ctx() {
            this.ctx = {
                length: 0
            };
        }
        Object.defineProperty(Ctx.prototype, "size", {
            get: function () {
                var _this = this;
                return Object.keys(this.ctx)
                    .map(function (index) {
                    var ctx = _this.ctx[index];
                    if (ctx && ctx.length) {
                        return ctx.length;
                    }
                    return 0;
                }).reduce(function (a, b) { return a + b; }, 0);
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Ctx.prototype, "length", {
            get: function () {
                return this.ctx.length;
            },
            enumerable: false,
            configurable: true
        });
        Ctx.prototype.clear = function (index) {
            if (this.ctx[index]) {
                this.ctx[index] = [];
            }
        };
        Ctx.prototype.remove = function (index) {
            if (this.ctx[index]) {
                delete this.ctx[index];
                this.ctx.length -= 1;
            }
        };
        Ctx.prototype.add = function (ctx, chunk) {
            if (chunk.index === 0) {
                if (!this.ctx[chunk.block.index]) {
                    this.ctx[chunk.block.index] = [];
                    this.ctx.length += 1;
                }
            }
            this.ctx[chunk.block.index][chunk.index] = ctx;
        };
        Ctx.prototype.toArray = function () {
            return Array.from(this.ctx);
        };
        Ctx.prototype.clearArray = function () {
            return this.toArray().filter(function (i) { return i; });
        };
        Ctx.prototype.selfEqual = function () {
            return this.clearArray().length === this.ctx.length;
        };
        Ctx.prototype.toCtxString = function () {
            return this.clearArray().map(function (ctx) { return ctx[ctx.length - 1]; }).toString();
        };
        Ctx.prototype.stringify = function () {
            return JSON.stringify(this.ctx);
        };
        return Ctx;
    }());
    exports.default = Ctx;
});
define("service", ["require", "exports", "core/status", "qetag/index", "worker/index", "qetag/worker-script", "http/worker-script", "core/file", "http/index", "core/utils", "constants/status", "core/ctx", "third-parts/merge"], function (require, exports, status_3, index_1, index_2, worker_script_1, worker_script_2, file_1, index_3, utils_6, status_4, ctx_1, merge_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    status_3 = __importDefault(status_3);
    index_1 = __importDefault(index_1);
    index_2 = __importDefault(index_2);
    worker_script_1 = __importDefault(worker_script_1);
    worker_script_2 = __importDefault(worker_script_2);
    file_1 = __importDefault(file_1);
    index_3 = __importDefault(index_3);
    ctx_1 = __importDefault(ctx_1);
    var qetagWorkers;
    var uploaderWorkers;
    var Service = (function (_super) {
        __extends(Service, _super);
        function Service(file, fileProps, config) {
            if (fileProps === void 0) { fileProps = {}; }
            if (config === void 0) { config = {}; }
            var _this = _super.call(this) || this;
            _this.progress = 0;
            _this.hashCalcProgress = 0;
            _this.lastProgress = {
                time: null,
                size: 0
            };
            _this.rate = '0KB/S';
            _this.bytesPreSecond = 0;
            _this.tokenInfo = {
                uploadToken: "",
                createInfo: {},
                type: "",
                filePath: "",
                created: false,
                partUploadUrl: "https://upload-v1.6pan.cn",
                directUploadUrl: "https://upload-v1.6pan.cn/file/upload"
            };
            _this.file = new file_1.default({
                file: file,
                blockSize: Service.default.blockSize,
                chunkSize: Service.default.chunkSize
            });
            _this.props = fileProps;
            if (config.adapter) {
                if (!(config.adapter in index_1.default)) {
                    delete config.adapter;
                }
            }
            _this.config = Object.assign({
                adapter: 'Normal',
                onStatusChange: function () { }
            }, config);
            _this.log = utils_6.log(Boolean(_this.config.debug));
            _this.sizeStr = utils_6.sizeToStr(_this.file.size);
            _this.ctx = new ctx_1.default();
            _this._setStatusHandler();
            return _this;
        }
        Service.prototype.isExisted = function () {
            if (this.normalFile) {
                return true;
            }
            return false;
        };
        Service.prototype.setFileInfo = function (info) {
            if (info.created) {
                this.setNormalFile(info.createInfo);
            }
            else {
                this.tokenInfo = info;
            }
        };
        Service.prototype.isUploadInfoExist = function () {
            return Boolean(this.normalFile) || Boolean(this.tokenInfo.uploadToken);
        };
        Service.prototype.setNormalFile = function (file) {
            this.normalFile = file;
        };
        Service.prototype._qetag = function () {
            var _this = this;
            if (!this.qetag) {
                if (!qetagWorkers && this.config.adapter === 'Worker') {
                    qetagWorkers = new index_2.default(index_2.default.asyncFnMover(worker_script_1.default), Service.default.taskConcurrencyInWorkers);
                }
                this.qetag = new index_1.default[this.config.adapter](this.file, {
                    workers: qetagWorkers
                });
                this.qetag.on(index_1.default.Base.Events.UpdateProgress, function (progress) {
                    _this.hashCalcProgress = progress;
                    _this.config.onStatusChange(_this, _this.status);
                });
            }
            return this.qetag;
        };
        Service.prototype._http = function () {
            var _this = this;
            if (!this.http) {
                if (!uploaderWorkers && this.config.adapter === 'Worker') {
                    uploaderWorkers = new index_2.default(index_2.default.asyncFnMover(worker_script_2.default), Service.default.taskConcurrencyInWorkers);
                }
                this.http = new index_3.default[this.config.adapter]({
                    workers: uploaderWorkers
                });
                var throttle_1 = utils_6.createThrottle(1000);
                this.http.on(index_3.default.Base.Events.UpdateProgress, function () {
                    throttle_1(function () {
                        _this.setProgress();
                    });
                });
            }
            return this.http;
        };
        Service.prototype.setProgress = function () {
            var now = new Date().getTime();
            var chunkSize = Service.default.chunkSize;
            var bytesUploaded = this.ctx.size * chunkSize;
            if (this.lastProgress.time) {
                this.bytesPreSecond = Math.floor((bytesUploaded - this.lastProgress.size) / ((now - this.lastProgress.time) / 1000));
                this.rate = utils_6.sizeToStr(this.bytesPreSecond) + '/S';
            }
            this.lastProgress = {
                time: now,
                size: bytesUploaded
            };
            var progress = parseFloat((bytesUploaded * 100 / this.file.size).toFixed(2));
            if (progress > 100) {
                progress = 100;
            }
            this.progress = progress;
            if (this.bytesPreSecond >= 0 &&
                this.isUploading()) {
                this.setStatus(status_4.STATUS.UPLOADING);
            }
        };
        Service.prototype._setStatusHandler = function () {
            var _this = this;
            var onChange = function () {
                _this.config.onStatusChange(_this, _this.status);
            };
            this.addStatusHandler(status_4.STATUS.CALCULATING, onChange)
                .addStatusHandler(status_4.STATUS.CANCEL, function () {
                var _a, _b, _c;
                (_a = _this.http) === null || _a === void 0 ? void 0 : _a.removeAllListeners();
                (_b = _this.qetag) === null || _b === void 0 ? void 0 : _b.emit('race-to-stop');
                (_c = _this.qetag) === null || _c === void 0 ? void 0 : _c.removeAllListeners();
                onChange();
            })
                .addStatusHandler(status_4.STATUS.DONE, function () {
                var _a;
                _this.progress = 100;
                (_a = _this.qetag) === null || _a === void 0 ? void 0 : _a.removeAllListeners();
                onChange();
            })
                .addStatusHandler(status_4.STATUS.FAILED, onChange)
                .addStatusHandler(status_4.STATUS.PAUSE, function () {
                var _a;
                _this.tryCount = 0;
                (_a = _this.qetag) === null || _a === void 0 ? void 0 : _a.emit('race-to-stop');
                onChange();
            })
                .addStatusHandler(status_4.STATUS.PENDING, function () {
                _this.tryCount = 0;
                onChange();
            })
                .addStatusHandler(status_4.STATUS.PREPARING, onChange)
                .addStatusHandler(status_4.STATUS.UPLOADING, onChange);
        };
        Service.prototype.chunkUpload = function (chunk, ctx) {
            var http = this._http();
            var _a = Service.default, clientConfig = _a.clientConfig, apis = _a.apis;
            var config = {
                url: '',
                data: chunk.blob,
                credentials: 'omit',
                config: merge_2.merge({}, clientConfig, {
                    baseURL: this.tokenInfo.partUploadUrl,
                    headers: {
                        'Authorization': this.tokenInfo.uploadToken,
                        'UploadBatch': this.file.batch,
                        'Content-Type': 'application/octet-stream'
                    }
                })
            };
            if (chunk.index === 0) {
                config.url = "" + apis.mkblk + chunk.block.size + "/" + chunk.block.index;
            }
            else {
                config.url = "" + apis.bput + ctx + "/" + chunk.startByte;
            }
            config.url = this.tokenInfo.partUploadUrl + config.url;
            return http.post(config, {
                isTransferablesSupported: index_2.default.isTransferablesSupported(),
                isEmitEvent: true
            });
        };
        Service.prototype.createFile = function () {
            var http = this._http();
            var _a = Service.default, clientConfig = _a.clientConfig, apis = _a.apis;
            return http.post({
                url: this.tokenInfo.partUploadUrl + apis.mkfile + this.file.size,
                data: this.ctx.toCtxString(),
                credentials: 'omit',
                config: merge_2.merge({}, clientConfig, {
                    baseURL: this.tokenInfo.partUploadUrl,
                    headers: {
                        'Authorization': this.tokenInfo.uploadToken,
                        'UploadBatch': this.file.batch,
                        'Content-Type': 'text/plain;charset=UTF-8'
                    }
                })
            });
        };
        Service.prototype.getHash = function (raceFunction) {
            var qetag = this._qetag();
            if (qetag.isExist()) {
                return Promise.resolve(qetag.getSync());
            }
            return qetag.get({
                isTransferablesSupported: index_2.default.isTransferablesSupported(),
                isEmitEvent: true
            }, raceFunction);
        };
        Service.prototype.getHashSync = function () {
            var qetag = this._qetag();
            return qetag.getSync();
        };
        Service.prototype.setHash = function (hash) {
            var qetag = this._qetag();
            qetag.set(hash);
        };
        Service.prototype._getDefaultRequestHeader = function () {
            var _a;
            var _b = Service.default, AuthorizationTokenKey = _b.AuthorizationTokenKey, AuthorizationStorageKey = _b.AuthorizationStorageKey;
            var token = localStorage.getItem(AuthorizationStorageKey);
            if (token) {
                return {
                    headers: (_a = {},
                        _a[AuthorizationTokenKey] = token,
                        _a)
                };
            }
            return {};
        };
        Service.prototype.getTokenInfo = function () {
            return __awaiter(this, void 0, void 0, function () {
                var http, params, result;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            http = this._http();
                            params = {
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
                            return [4, http.post({
                                    url: Service.default.clientConfig.baseURL + Service.default.apis.token,
                                    data: JSON.stringify(params),
                                    credentials: 'include',
                                    config: merge_2.merge({}, Service.default.clientConfig, this._getDefaultRequestHeader())
                                }).then(function (json) {
                                    if (json.success === false) {
                                        throw new Error(json.message);
                                    }
                                    return json;
                                })];
                        case 1:
                            result = _a.sent();
                            return [2, result];
                    }
                });
            });
        };
        return Service;
    }(status_3.default));
    exports.default = Service;
});
define("index", ["require", "exports", "constants/status", "service", "constants/status"], function (require, exports, status_5, service_1, status_6) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.WebFile = exports.UPLOADING_STATUS = exports.TASK_STATUS_INFO = exports.STATUS = void 0;
    service_1 = __importDefault(service_1);
    Object.defineProperty(exports, "STATUS", { enumerable: true, get: function () { return status_6.STATUS; } });
    Object.defineProperty(exports, "TASK_STATUS_INFO", { enumerable: true, get: function () { return status_6.TASK_STATUS_INFO; } });
    Object.defineProperty(exports, "UPLOADING_STATUS", { enumerable: true, get: function () { return status_6.UPLOADING_STATUS; } });
    var WebFile = (function (_super) {
        __extends(WebFile, _super);
        function WebFile(file, fileProps, config) {
            if (fileProps === void 0) { fileProps = {}; }
            if (config === void 0) { config = {}; }
            var _this = _super.call(this, file, fileProps, config) || this;
            _this.pos = [];
            return _this;
        }
        WebFile.prototype.pause = function () {
            if (this.isUploading()) {
                this.setStatus(status_5.STATUS.PAUSE);
                return Promise.resolve();
            }
            return Promise.reject(new Error("Warning: Non-uploading"));
        };
        WebFile.prototype.resume = function () {
            if (this.isFailed()) {
                this.restTryCount();
                return this.upload();
            }
            if (this.isPaused()) {
                return this.upload();
            }
            if (this.isCancel()) {
                return Promise.reject(new Error("Error: Uploader destoryed"));
            }
            return Promise.reject(new Error("Warning: Uploading"));
        };
        WebFile.prototype.cancel = function () {
            this.setStatus(status_5.STATUS.CANCEL);
            return Promise.resolve();
        };
        WebFile.prototype.upload = function () {
            return __awaiter(this, void 0, void 0, function () {
                var qetag, resolveRefs_1, result, e_1, e_2;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (this.isUploading()) {
                                throw new Error("Warning: Uploading");
                            }
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 7, , 8]);
                            this.setStatus(status_5.STATUS.CALCULATING);
                            qetag = this._qetag();
                            qetag.removeAllListeners('race-to-stop');
                            qetag.on('race-to-stop', function () {
                                resolveRefs_1 && resolveRefs_1('race-to-stop');
                            });
                            return [4, this.getHash(new Promise(function (resolve) {
                                    resolveRefs_1 = resolve;
                                }))];
                        case 2:
                            _a.sent();
                            if (qetag.getSync() === 'race-to-stop') {
                                qetag.set('');
                                return [2];
                            }
                            this.setStatus(status_5.STATUS.PREPARING);
                            if (!!this.isUploadInfoExist()) return [3, 6];
                            _a.label = 3;
                        case 3:
                            _a.trys.push([3, 5, , 6]);
                            return [4, this.getTokenInfo()];
                        case 4:
                            result = _a.sent();
                            this.setFileInfo(result);
                            return [3, 6];
                        case 5:
                            e_1 = _a.sent();
                            this.recordError(e_1);
                            this.setStatus(status_5.STATUS.FAILED);
                            return [2];
                        case 6:
                            if (this.isExisted()) {
                                this.setStatus(status_5.STATUS.DONE);
                                return [2];
                            }
                            if (this.isCancel()) {
                                throw new Error("Warning: Cancel upload");
                            }
                            this.setStatus(status_5.STATUS.UPLOADING);
                            this.start();
                            return [3, 8];
                        case 7:
                            e_2 = _a.sent();
                            this.recordError(e_2);
                            this.setStatus(status_5.STATUS.FAILED);
                            return [3, 8];
                        case 8: return [2];
                    }
                });
            });
        };
        WebFile.prototype.start = function () {
            return __awaiter(this, void 0, void 0, function () {
                var data, res, e_3;
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (this.isDone()) {
                                return [2];
                            }
                            if (this.isPaused()) {
                                return [2];
                            }
                            try {
                                if (this.isCancel()) {
                                    throw new Error("Warning: Cancel upload");
                                }
                                if (this.isTryout()) {
                                    throw new Error("Warning: Upload Tryout");
                                }
                            }
                            catch (e) {
                                this.recordError(e);
                                this.setStatus(status_5.STATUS.FAILED);
                                return [2];
                            }
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 4, , 5]);
                            if (!(this.ctx.size === this.file.getChunksSize())) return [3, 3];
                            return [4, this.createFile()];
                        case 2:
                            data = _a.sent();
                            if (this.isDone()) {
                                return [2];
                            }
                            if (data.code) {
                                throw new Error("Create: " + data.message);
                            }
                            res = JSON.parse(data.response);
                            if (res.hash !== this.getHashSync()) {
                                throw new Error("Warning: File check failed");
                            }
                            this.setNormalFile(res);
                            this.setStatus(status_5.STATUS.DONE);
                            return [2];
                        case 3:
                            this.setPos();
                            this.pos.filter(function (p) { return p.status === status_5.STATUS.PENDING; }).map(function (v) {
                                v.status = status_5.STATUS.UPLOADING;
                                _this.blockStart(v);
                            });
                            return [3, 5];
                        case 4:
                            e_3 = _a.sent();
                            this.recordError(e_3);
                            if (!this.isTryout()) {
                                this.markTry();
                                this.start();
                            }
                            return [2];
                        case 5: return [2];
                    }
                });
            });
        };
        WebFile.prototype.setPos = function () {
            var pos = Math.max.apply(null, this.pos.length ? this.pos.map(function (p) { return p.index; }) : [-1]);
            this.pos = this.pos.filter(function (pos) { return pos.status !== status_5.STATUS.DONE; });
            var len = WebFile.default.concurrency - this.pos.length;
            if (len < 0) {
                len = 0;
            }
            while (len) {
                pos++;
                if (this.file.getBlockByIndex(pos)) {
                    this.pos.push({
                        index: pos,
                        status: status_5.STATUS.PENDING
                    });
                }
                len--;
            }
        };
        WebFile.prototype._orderTask = function (chunks) {
            var _this = this;
            var promise = Promise.resolve();
            var _loop_1 = function (i) {
                var chunk = chunks[i];
                promise = promise
                    .then(function (ctx) { return _this.chunkUpload(chunk, ctx); })
                    .then(function (res) {
                    if (res.code) {
                        throw new Error("Chunk: " + res.message);
                    }
                    _this.ctx.add(res.ctx, chunk);
                    return res.ctx;
                });
            };
            for (var i = 0; i < chunks.length; i++) {
                _loop_1(i);
            }
            return promise;
        };
        WebFile.prototype.blockStart = function (info) {
            return __awaiter(this, void 0, void 0, function () {
                var block, chunks, e_4;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            block = this.file.getBlockByIndex(info.index);
                            chunks = block.getChunks();
                            return [4, this._orderTask(chunks)];
                        case 1:
                            _a.sent();
                            info.status = status_5.STATUS.DONE;
                            this.start();
                            return [3, 3];
                        case 2:
                            e_4 = _a.sent();
                            info.status = status_5.STATUS.PENDING;
                            this.recordError(e_4);
                            this.ctx.clear(info.index);
                            if (!this.isTryout()) {
                                this.markTry();
                                this.start();
                            }
                            return [3, 3];
                        case 3: return [2];
                    }
                });
            });
        };
        return WebFile;
    }(service_1.default));
    exports.WebFile = WebFile;
});
