/**
 * 上传状态
 */
export enum STATUS {
    /**
     * 等待状态，默认状态
     */
    PENDING = 1,
    /**
     * 准备上传状态，此时标注hash已准备完毕，将要上传
     */
    PREPARING,
    /**
     * 进行上传中的状态
     */
    UPLOADING,
    /**
     * 计算哈希的状态
     */
    CALCULATING,
    /**
     * 上传失败的状态
     */
    FAILED,
    /**
     * 上传成功的状态,上传成功监听将清空，再次上传将不可用
     */
    DONE,
    /**
     * 上传取消的状态，上传取消将清空内部事件监听，再次上传将不可用
     */
    CANCEL,
    /**
     * 暂停状态
     */
    PAUSE
}

/**
 * 上传状态的中文表述
 */
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

/**
 * 上传中状态的集合，我们将准备上传，上传中，计算哈希中状态
 * 统一称之为上传中状态集合
 */
export const UPLOADING_STATUS = {
    [STATUS.PREPARING]: 1,
    [STATUS.UPLOADING]: 1,
    [STATUS.CALCULATING]: 1
};
