/**
 * worker计算hash用脚本方法
 *
 * @export
 * @param {*} data
 * @return {*}  {Promise<any>}
 */
export default function handler(data: any): Promise<any> {
    return new Promise(function (resolve, reject) {
        const payload = data.payload;
        if (typeof FileReader === "undefined") {
            reject(new Error('FileReaderAPI not support in WebWorkers'));
        }
        const fr = new FileReader();
        fr.onload = function (): any {
            if (fr.result) {
                if (typeof crypto === 'undefined') {
                    reject(new Error('Crypto Api not support in WebWorkers'));
                }
                if (typeof crypto.subtle === 'undefined') {
                    reject(new Error('Crypto.Subtle Api not support in WebWorkers'));
                }
                crypto.subtle.digest('SHA-1', fr.result as ArrayBuffer)
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