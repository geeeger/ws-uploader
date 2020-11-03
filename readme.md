# About
[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fgeeeger%2Fws-uploader.svg?type=shield)](https://app.fossa.com/projects/git%2Bgithub.com%2Fgeeeger%2Fws-uploader?ref=badge_shield)
[![CodeScene Code Health](https://codescene.io/projects/7388/status-badges/code-health)](https://codescene.io/projects/7388)
[![CodeScene System Mastery](https://codescene.io/projects/7388/status-badges/system-mastery)](https://codescene.io/projects/7388)


清真云上传器

---

commonjs包, 不支持扩展，单文件实例操作分片上传

# Usage

[demo](https://geeeger.github.io/ws-uploader/example/index.html)

[docs](https://geeeger.github.io/ws-uploader/docs/)

### 静态配置

```javascript
import { WebFile as Uploader } from '@geeeger/ws-uploader'
Uploader.config({
    // fetch设置
    // 默认如下，非必须
    clientConfig: {
        baseURL: 'https://api.2dland.cn',
        headers: {
            'Content-Type': 'application/json'
        }
    },
    // 所需用到的api
    // 默认如下，非必须
    apis: {
        token: '/v3/file/uploadToken',
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
```

### 一般使用

```javascript
let file = MockFile('test.wtf', 10 * 1024 * 1024 + 1058, 'plain/text')
let uploader = new Uploader(file, {
    // path参数,选其一
    path: '/',
    // parent: '',
    // 是否可覆盖，非必须，默认为 0，可选值 0x00 0x02 0x20(0, 2, 32) 
    op: 2
},{
    // Worker , Normal 二选一， 默认Normal
    adapter: 'Normal',
    onStatusChange: (ctx, status) => {
        const info = {
            ...ctx,
            file: {
                ...ctx.file,
                blocks: []
            },
            qetag: null,
            http: null
        };

        t.innerHTML = Object.keys(info).map((key) => {
            return (key + ':') + (typeof info[key] === 'object' ? JSON.stringify(info[key]) : info[key])
        }).join('<hr>');
        if (status === STATUS.CALCULATING) {
            console.log(ctx.hashCalcProgress)
        }
        if (status === STATUS.UPLOADING) {
            console.log(ctx.progress)
        }
        if (status === STATUS.FAILED) {
            // ctx 可以拿到 uploader实例， 可以报送任意内容
            // uploader实例下挂载着file实例，file实例可获取到batchId，可用于打log。
            // 各类信息均集中在uploader实例中，在下部分贴出
            ctx.error.map(x => console.error(x.stack))
        }
        // 当上传完成时，再次上传将不可用
        if (status === STATUS.DONE) {
            alert(new Date() - time)
        }
    },
    debug: true
})

uploader.upload()
// 在mkfile阶段禁止，理论上pause无用是正确的
delay(() => {
    // 调用pause只能调用resume复原.
    uploader.pause()
    delay(() => {
        uploader.resume()
    })
}, 1500)
```

### 各模块声明

```typescript

```

## 依赖

依赖模块events，依赖window.crypto.subtle

---

关于window.crypto.subtle，参见[webcrypto](https://www.chromium.org/blink/webcrypto)


## License
[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fgeeeger%2Fws-uploader.svg?type=large)](https://app.fossa.com/projects/git%2Bgithub.com%2Fgeeeger%2Fws-uploader?ref=badge_large)