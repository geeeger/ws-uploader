import { EventEmitter } from "events";

export interface MyWorker {
    tasks: number;
    buzy: boolean;
    instance: Worker;
}

export interface WorkerMessage {
    channel: string;
    payload?: any;
}

export type WorkerMessages = [
    WorkerMessage,
    PostMessageOptions?
];

export interface WorkersProvider extends EventEmitter {
    workers: MyWorker[];
    cpus: number;
    messages: WorkerMessages[];
    onmessage(e: MessageEvent): void;
    send(message: WorkerMessage, transfer?: PostMessageOptions): void;
    run(): void;
    destroy(): void;
    removeMessage(message: WorkerMessage): void;
    removeMessagesByChannel(channel: string): void;
}

export interface QZFile {
    file: File;
    batch: string;
    blockSize: number;
    chunkSize: number;
    blocks: Block[];
    name: string;
    lastModified: number;
    ext: string;
    size: number;
    type: string;
    slice(start: number, end: number): Blob;
    getBlocks(): Block[];
    getBlockByIndex(index: number): Block;
}

export interface HttpClient {
    post: <T>(props: HttpClientProps, extrnal1?: any) => Promise<T>;
}

export interface QZFileProps {
    file: File;
    blockSize?: number;
    chunkSize?: number;
    batch?: string;
}

export interface Block {
    startByte: number;
    endByte: number;
    file: QZFile;
    index: number;
    size: number;
    blob: Blob;
}

export interface Chunk {
    startByte: number;
    endByte: number;
    size: number;
    block: Block;
    blob: Blob;
    index: number;
}

export interface QETagBase {
    file: QZFile;
    hash: string;
    get?(): PromiseLike<string>;
    set(hash: string): void;
    getSync(): string;
}

export interface QETagNormal extends QETagBase {
    concurrency: number;
}

export interface QETagWorker extends QETagBase {
    channel: string;
    workers: WorkersProvider;
}

export interface HttpClientProps {
    url: string;
    data: any;
    config?: any;
    credentials?: "include" | "omit" | "same-origin" | undefined;
}
