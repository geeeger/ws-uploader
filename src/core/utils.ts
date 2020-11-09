/**
 * @description 生成guid
 * @export
 * @returns {string}
 */
export function guid(): string {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c: string): string => {
        const r = (Math.random() * 16) | 0;
        const v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}

/**
 * @description 判断是否为二进制对象
 * @export
 * @param {*} blob
 * @returns {boolean}
 */
export function isBlob(blob: any): boolean {
    return Object.prototype.toString.call(blob) === '[object Blob]';
}

/**
 * @description 判断是否为js对象
 * @export
 * @param {*} obj
 * @returns {boolean}
 */
export function isObject(obj: any): boolean {
    return Object.prototype.toString.call(obj) === '[object Object]';
}

/**
 * @description 拼接buffer
 * @export
 * @param {ArrayBuffer} buf1
 * @param {ArrayBuffer} buf2
 * @returns {ArrayBuffer}
 */
export function concatBuffer(buf1: ArrayBuffer, buf2: ArrayBuffer): ArrayBuffer {
    const tmp = new Uint8Array(buf1.byteLength + buf2.byteLength)
    tmp.set(new Uint8Array(buf1), 0)
    tmp.set(new Uint8Array(buf2), buf1.byteLength)
    return tmp.buffer
}

/**
 * @description ArrayBuffer 转换为base64
 * @export
 * @param {ArrayBuffer} buffer
 * @returns {string}
 */
export function arrayBufferToBase64(buffer: ArrayBuffer): string {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa( binary );
}

/**
 * @description 返回url friendly的base64结构
 * @export
 * @param {string} base64
 * @returns {string}
 */
export function urlSafeBase64(base64: string): string {
    return base64.replace(/\//g, "_").replace(/\+/g, "-");
}

/**
 * @description 创建节流函数
 * @export
 * @param {number} time
 * @returns {(fn: any) => void}
 */
export function createThrottle(time: number): (fn: any) => void {
    let timer: any = null
    return function throttle(fn: any): void {
        if (timer) {
            return
        }
        timer = setTimeout(() => {
            fn()
            timer = null
        }, time)
    }
}

const byteReduce = (byte: number): {
    val: string,
    unit: string
} => {
    function getNextLevel(byte: number, level = 0): any {
        if (byte >= 1024) {
            return getNextLevel(byte / 1024, level + 1)
        } else {
            const units: any = {
                0: 'B',
                1: 'KB',
                2: 'MB',
                3: 'GB',
                4: 'TB',
                5: 'PB'
            }
            return {
                val: Number(byte).toFixed(2),
                unit: units[level] || 'unknown'
            }
        }
    }
    return getNextLevel(byte)
}

/**
 * @description 格式化数据大小
 * @export
 * @param {number} size
 * @returns {string}
 */
export function sizeToStr(size: number): string {
    const res = byteReduce(size)
    return res.val + res.unit;
}

/**
 * @description 日志
 * @export
 * @param {boolean} debug
 * @return {*}  {*}
 */
export function log(debug: boolean): any {
    return function (...args: any[]) {
        if (debug) {
            // @ts-ignore
            console.log.apply(null, args)
        }
    }
}

/**
 * @description promise 链生成器
 * @export
 * @template T
 * @param {*} config
 * @param {*} service
 * @param {*} interceptors
 * @return {*}  {T}
 */
export function makePromiseChain<T>(config: any, service: any, interceptors: any): T {
    const chain: any[] = [service, undefined]

    interceptors.request.forEach((interceptor: any) => {
        chain.unshift(interceptor.fulfilled, interceptor.rejected)
    })

    interceptors.response.forEach((interceptor: any) => {
        chain.push(interceptor.fulfilled, interceptor.rejected)
    })

    // console.log(chain.map(item => item && item.toString()))

    let promise: any = Promise.resolve(config)

    while (chain.length) {
        promise = promise.then(chain.shift(), chain.shift())
    }

    return promise;
}
