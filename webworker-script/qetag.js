
module.exports = function handler(data) {
    var payload = data.payload;
    var Base64 = require("crypto-js/enc-base64")
    var WordArray = require("crypto-js/lib-typedarrays")
    var SHA1 = require("crypto-js/sha1")
    if (typeof FileReader === "undefined") {
        return Promise.reject(new Error('FileReaderAPI not support'));
    }

    return new Promise(function (resolve, reject) {
        var fr = new FileReader();
        fr.onload = function () {
            if (fr.result) {
                var wordarray = WordArray.create(fr.result);
                var sha1hash = SHA1(wordarray).toString(Base64);
                resolve({
                    data: sha1hash,
                    index: payload.index,
                })
            }
        };
        fr.onerror = function () {
            reject(new Error("Read file error"));
        };
        fr.onloadend = function () {
            fr.onloadend = fr.onload = fr.onerror = null;
        };
        fr.readAsArrayBuffer(payload.blob);
    })
}
