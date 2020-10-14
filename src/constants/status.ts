export enum STATUS {
    PENDING = 1,
    PREPARING,
    UPLOADING,
    CALCULATING,
    FAILED,
    DONE,
    CANCEL,
    PAUSE
}

export const TASK_STATUS_INFO = {
    [STATUS.PENDING]: '排队中...',
    [STATUS.PREPARING]: '准备中...',
    [STATUS.UPLOADING]: '上传中...',
    [STATUS.CALCULATING]: '计算中...',
    [STATUS.FAILED]: '上传失败',
    [STATUS.DONE]: '上传完成',
    [STATUS.CANCEL]: '取消上传',
    [STATUS.PAUSE]: '暂停上传'
};

export const UPLOADING_STATUS = {
    [STATUS.PREPARING]: 1,
    [STATUS.UPLOADING]: 1,
    [STATUS.CALCULATING]: 1
};
