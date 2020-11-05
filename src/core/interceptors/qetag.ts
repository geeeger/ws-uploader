import QETagBase from "../../qetag/base";
import InterceptorManager from "../interceptor-manager"; 
import { arrayBufferToBase64, concatBuffer, urlSafeBase64 } from '../utils';

type QeTagConfig = {
    isTransferSupported?: boolean
    isEmitEvent?: boolean
    racePromise?: Promise<any>
    tag: QETagBase
}

type QeTagInterceptor<T> = (value: T) => T | Promise<T>

type QeTagReject = (error: any) => any

const qetag = {
    request: new InterceptorManager<QeTagInterceptor<QeTagConfig>, QeTagReject>(),
    response: new InterceptorManager<QeTagInterceptor<QETagBase>, QeTagReject>()
}

qetag.request.use(function preparQeTagCalcConfig(config) {
    const { tag } = config;
    tag.raceToStop = false;
    tag.removeAllListeners('race-to-stop');
    let rejectRefs: any;
    config.racePromise = new Promise((_, reject) => {
        rejectRefs = reject
    });
    tag.on('race-to-stop', () => {
        const error = new Error('race-to-stop');
        // @ts-ignore
        error.tag = tag;
        rejectRefs && rejectRefs(error);
    });
    return config;
}, undefined, 'prepare-race-to-stop-action');

qetag.request.use(function throwErrorIfNotSupport(config) {
    if (typeof crypto === 'undefined') {
        const error = new Error('Crypto API Error: crypto is not support');
        return Promise.reject(error);
    }
    if (!crypto.subtle) {
        const error = new Error('Crypto API Error: crypto.subtle is supposed to be undefined in insecure contexts');
        return Promise.reject(error);
    }
    return config;
}, undefined, 'throw-if-crypto-not-support');

qetag.response.use((i) => {
    return i
}, function handleRaceToStop(error) {
    const { tag } = error;
    if (error.message === 'race-to-stop') {
        tag.raceToStop = true;
        tag.hash = '';
        return tag
    }
    return Promise.reject(error);
}, 'handle-race-to-stop-action');

qetag.response.use(async function calcPureHash(tag) {
    const { file, hashs } = tag;
    let perfex = Math.log2(file.blockSize);
    const isSmallFile = hashs.length === 1;
    let hash = null;
    if (isSmallFile) {
        hash = hashs[0];
    } else {
        perfex = 0x80 | perfex;
        hash = hashs.reduce((a, b): ArrayBuffer => concatBuffer(a, b));
        hash = await crypto.subtle.digest('SHA-1', hash);
    }
    const byte = new ArrayBuffer(1);
    const dv = new DataView(byte);
    dv.setUint8(0, perfex);
    hash = concatBuffer(byte, hash);
    hash = arrayBufferToBase64(hash);
    tag.pureHash = urlSafeBase64(hash);
    return tag;
}, undefined, 'calc-pure-hash');

qetag.response.use(function getHash(tag) {
    if (!tag.raceToStop) {
        tag.set(tag.pureHash + tag.file.size.toString(36))
    }
    return tag;
}, undefined, 'calc-hash');

export default qetag;
