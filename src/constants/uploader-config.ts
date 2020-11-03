/**
 * 上传静态配置（所有上传实例通用配置）
 */
export const UploaderConfig = {
    /**
     * 服务基础配置
     */
    clientConfig: {
        /**
         * api 地址配置，默认 api.6pan.cn
         */
        baseURL: 'https://api.6pan.cn',
        /**
         * fetch 上传类型基础配置，默认如下
         */
        headers: {
            'Content-Type': 'application/json'
        }
    },
    /**
     * api path配置
     */
    apis: {
        /**
         * 获取文件上传token服务
         */
        token: '/v3/file/uploadToken',
        /**
         * 生成文件块服务
         */
        mkblk: '/mkblk/',
        /**
         * 生成块内片服务
         */
        bput: '/bput/',
        /**
         * 生成文件命令
         */
        mkfile: '/mkfile/'
    },
    /**
     * 如您使用的是Auth认证，指定的Auth请求头名称
     */
    AuthorizationTokenKey: 'qingzhen-token',
    /**
     * 如您使用的是localstorage储存的Auth信息，uploader将会从以下key获取值填入 AuthorizationToken 请求头中
     */
    AuthorizationStorageKey: 'user-authorization-token',
    /**
     * 最大重试次数
     */
    chunkRetry: 3,
    /**
     * 分片和计算hash使用的块大小，默认如下，无需更改
     */
    blockSize: 4 * 1024 * 1024,
    chunkSize: 1 * 1024 * 1024,
    /**
     * 并发上传数（块级上传，非必须,默认如下）
     */
    concurrency: 3,
    /**
     * 可并发执行任务数（非必须，默认3即可）
     * 此参数主要在worker任务中起作用
     * 基本表示一个worker线程在非忙时可承担的最大任务数
     * 设置大了意义不大
     */
    taskConcurrencyInWorkers: 3,
}