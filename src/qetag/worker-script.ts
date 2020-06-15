export default function handler(data: any): Promise<any> {
    const payload = data.payload;
    if (typeof FileReader === "undefined") {
        return Promise.reject(new Error('FileReaderAPI not support'));
    }

    return new Promise(function (resolve, reject) {
        const fr = new FileReader();
        fr.onload = function (): any {
            if (fr.result) {
                self.crypto.subtle.digest('SHA-1', fr.result as ArrayBuffer)
                    .then(sha1 => {
                        resolve({
                            sha1: sha1,
                            index: payload.index
                        })
                    })
            }
        };
        fr.onerror = function (): void {
            reject(new Error("Read file error"));
        };
        fr.readAsArrayBuffer(payload.blob);
    })
}