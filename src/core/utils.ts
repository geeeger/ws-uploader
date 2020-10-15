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

/**
 * @description 格式化数据大小
 * @export
 * @param {number} size
 * @returns {string}
 */
export function sizeToStr(size: number): string {
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
