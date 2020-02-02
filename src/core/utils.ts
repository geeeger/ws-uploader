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
