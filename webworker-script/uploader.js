
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
    })).then(function(res){
        return {
            data: res.data,
            status: res.status,
            statusText: res.statusText
        }
    }, function (e) {
        if (e.response.data) {
            return {
                data: e.response.data,
                status: e.response.status,
                statusText: e.response.statusText
            };
        }
        return {
            data: {
                code: e.response.status,
                message: e.response.statusText
            },
            status: e.response.status,
            statusText: e.response.statusText
        }
    });
}
