export default function handler(data: any): Promise<any> {
    const payload = data.payload;

    const isBlob = Object.prototype.toString.call(payload.data) === '[object Blob]'
    return fetch(payload.url, {
        body: payload.data,
        method: 'POST',
        mode: 'cors',
        credentials: payload.credentials,
        headers: {
            ...(
                payload.config
                    ? payload.config.headers
                        ? payload.config.headers
                        : {}
                    : {}
            )
        }
    }).then(response => response.json())
        .then(response => {
            if (isBlob) {
                // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
                // @ts-ignore
                postMessage({
                    channel: data.channel,
                    payload: {
                        type: 'progress',
                        data: payload.data.size
                    }
                })
            }

            return response
        })
}