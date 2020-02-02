
module.exports = function handler(data) {
    var payload = data.payload;
    var client = require("axios/dist/axios");
    return client.post(payload.url, payload.data, Object.assign({}, payload.config, {
        onUploadProgress: (e) => {
            postMessage({
                channel: data.channel,
                payload: {
                    type: 'progress',
                    data: e.loaded
                }
            })
        }
    }));
}
