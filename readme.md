# About

清真云上传器

---

commonjs包, 不支持扩展，单文件实例操作分片上传

# Usage

```javascript
import { WebFile, STATUS } from '@geeeger/ws-uploader';

var t = document.querySelector('#status');
var s = document.querySelector('#input');
var b = document.querySelector('button');
var pause = document.querySelector('#stop');
var restart = document.querySelector('#start');
var cancel = document.querySelector('#cancel');
var f;
// 全局设置
CV.WebFile.config({
    // axios设置
    // 默认如下，非必须
    clientConfig: {
        baseURL: 'https://api.6pan.cn',
        timeout: 60000,
        headers: {
            'Content-Type': 'application/json'
        }
    },
    // 所需用到的api
    // 默认如下，非必须
    apis: {
        token: '/v2/upload/token',
        mkblk: '/mkblk/',
        bput: '/bput/',
        mkfile: '/mkfile/'
    },

    // Authorization header key
    // 默认如下，非必须
    AuthorizationTokenKey: 'qingzhen-token',

    // 本地存储的localStorage key
    // 默认如下，非必须
    AuthorizationStorageKey: 'user-authorization-token',

    // 块重试次数，此处命名错误
    // 默认如下，非必须
    chunkRetry: 3,

    // 不允许改动
    blockSize: 4 * 1024 * 1024,
    chunkSize: 1 * 1024 * 1024,
    /**
     * for block upload
     */
    // 并发上传数（块级，非必须,默认如下）
    concurrency: 3,
    // 可并发执行任务数（非必须，默认3即可）
    // 此参数主要在worker任务中起作用
    // 基本表示一个worker线程在非忙时可承担的最大任务数
    // 设置大了意义不大
    taskConcurrencyInWorkers: 3,
})
b.addEventListener('click', () => {
    var time = new Date();
    f = new WebFile(
        // 原始file对象
        t.files[0],
        {
            // path或parent参数
            identity: '',
            // 是否可覆盖，非必须，默认不覆盖
            override: true
        }, {
            // 启用何种工具进行hash或upload操作
            // 只有两种 Normal Worker
            adapter: 'Worker',
            onStatusChange: (ctx, status) => {
                var info = {
                    ...ctx,
                    file: {
                        ...ctx.file,
                        blocks: []
                    },
                    qetag: null,
                    http: null,
                    error: ctx.error.map(a => a.message)
                };

                s.innerHTML = Object.keys(info).map((key) => {
                    return (key + ':') + (typeof info[key] === 'object' ? JSON.stringify(info[key]) : info[key])
                }).join('<hr>');
                if (status === STATUS.CALCULATING) {
                    console.log(ctx.hashCalcProgress)
                }
                if (status === STATUS.UPLOADING) {
                    console.log(ctx.progress)
                }
                if (status === STATUS.FAILED) {
                    console.log(ctx.error.map(e => e.stack).join('\n\n'))
                }
                // 当上传完成时，再次上传将不可用
                if (status === STATUS.DONE) {
                    alert(new Date() - time)
                }
            }
        }
    )
    f.upload();
})
pause.addEventListener('click', function () {
    // tryCount置零
    // 暂停
    f.pause();
});
restart.addEventListener('click', function () {
    // 重新开启
    f.resume();
});
cancel.addEventListener('click', function () {
    // 取消，实例将不可用
    f.cancel();
});
```
