export const UploaderConfig = {
    clientConfig: {
        baseURL: 'https://api.6pan.cn',
        headers: {
            'Content-Type': 'application/json'
        }
    },
    apis: {
        token: '/v3/file/uploadToken',
        mkblk: '/mkblk/',
        bput: '/bput/',
        mkfile: '/mkfile/'
    },
    AuthorizationTokenKey: 'qingzhen-token',
    AuthorizationStorageKey: 'user-authorization-token',
    chunkRetry: 3,
    blockSize: 4 * 1024 * 1024,
    chunkSize: 1 * 1024 * 1024,
    /**
     * for block upload
     */
    concurrency: 3,
    taskConcurrencyInWorkers: 3,
}