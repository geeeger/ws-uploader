import { UploaderConfig } from "../constants/uploader-config";
import { merge } from "../third-parts/merge";

type Config = typeof UploaderConfig

/**
 * @description 基础构造器，含有静态配置
 * @export
 * @class Base
 */
export default class Base {
    /**
     * 全局共享的上传配置
     *
     * @static
     * @memberof Base
     */
    static default = UploaderConfig;

    /**
     * 设置全局共享的上传配置
     *
     * @static
     * @param {(Config | {
     *         clientConfig?: Config['clientConfig']
     *         api?: Config['apis']
     *         AuthorizationTokenKey?: Config['AuthorizationTokenKey']
     *         AuthorizationStorageKey?: Config['AuthorizationStorageKey']
     *         chunkRetry?: Config['chunkRetry']
     *         blockSize?: Config['blockSize']
     *         chunkSize?: Config['chunkSize']
     *         concurrency?: Config['concurrency'],
     *         taskConcurrencyInWorkers?: Config['taskConcurrencyInWorkers'],
     *     })} config
     * @memberof Base
     */
    public static config(config: Config | {
        clientConfig?: Config['clientConfig']
        api?: Config['apis']
        AuthorizationTokenKey?: Config['AuthorizationTokenKey']
        AuthorizationStorageKey?: Config['AuthorizationStorageKey']
        chunkRetry?: Config['chunkRetry']
        blockSize?: Config['blockSize']
        chunkSize?: Config['chunkSize']
        concurrency?: Config['concurrency'],
        taskConcurrencyInWorkers?: Config['taskConcurrencyInWorkers'],
    }): void {
        Base.default = merge(Base.default, config);
    }
}
