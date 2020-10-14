export function guid(): string {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c: string): string => {
        const r = (Math.random() * 16) | 0;
        const v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}

export function isBlob(blob: any): boolean {
    return Object.prototype.toString.call(blob) === '[object Blob]';
}

export function isObject(obj: any): boolean {
    return Object.prototype.toString.call(obj) === '[object Object]';
}

export function concatBuffer(buf1: ArrayBuffer, buf2: ArrayBuffer): ArrayBuffer {
    const tmp = new Uint8Array(buf1.byteLength + buf2.byteLength)
    tmp.set(new Uint8Array(buf1), 0)
    tmp.set(new Uint8Array(buf2), buf1.byteLength)
    return tmp.buffer
}

export function arrayBufferToBase64(buffer: ArrayBuffer): string {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa( binary );
}

export function urlSafeBase64(base64: string): string {
    return base64.replace(/\//g, "_").replace(/\+/g, "-");
}

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
