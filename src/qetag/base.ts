import Interface from "../../types/interface";
import { EventEmitter } from "events";

export default class QETagBase extends EventEmitter implements Interface.QETagBase {

    public static Events = {
        UpdateProgress: 'UpdateProgress'
    };
    public file: Interface.QZFile;
    public hash: string;
    public process: number;
    public constructor(file: Interface.QZFile) {
        super();
        this.file = file;
        this.hash = "";
        this.process = 0;
    }

    public set(hash: string): void {
        this.hash = hash;
    }

    public getSync(): string {
        return this.hash;
    }

    public isExist(): boolean {
        return Boolean(this.hash);
    }
}
