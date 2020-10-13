import { WorkerMessage, WorkerMessages } from "../../src/interface";
import WorkerProvider from "../../src/worker";
import os from 'os';
import "jsdom-worker";

describe('test WorkersProvider', () => {
    beforeEach(() => {

    })

    it("static isTransferablesSupported()", () => {
        // because Worker is mocked
        expect(WorkerProvider.isTransferablesSupported()).toBeFalsy();
    });

    it("static asyncFnMover()", () => {
        const blobUrl = WorkerProvider.asyncFnMover(function calc(data: WorkerMessage) {
            let payload = data.payload;
            const channel = data.channel;
            payload++;
            return Promise.resolve({
                channel,
                payload,
            });
        })
        expect(/^blob/.test(blobUrl)).toBeTruthy();
    });

    it("worker-provider should work", (done) => {
        expect.assertions(2)
        const wp = new WorkerProvider(WorkerProvider.asyncFnMover(function calc(data: WorkerMessage) {
            let payload = data.payload;
            const channel = data.channel;
            return new Promise(function (resolve) {
                resolve({
                    channel,
                    payload: payload.map((i: number) => i+1),
                })
            });
        }));
        wp.on("test", (msg: { type: string, data: any }) => {
            if (msg.type === 'data') {
                expect(msg.data.payload).toEqual([2]);
            }
            if (msg.type === 'error') {
                expect(msg.data).toBeInstanceOf(Error);
            }
        });
    
        wp.send({
            channel: "test",
            payload: [1],
        });
        wp.send({
            channel: "test",
            payload: 1,
        });
    
        setTimeout(() => {
            // jsdom-worker 不支持 terminate方法
            // wp.destroy();
            // expect(wp.workers).toBeNull();
            done();
        }, 200);
    });
    
    it("get cpus", () => {
        const wp = new WorkerProvider(WorkerProvider.asyncFnMover(function () {}));
        expect(wp.cpus).toBe(os.cpus().length);
    });

    it("removeMessage()", () => {
        // @ts-ignore
        const wp = new WorkerProvider(WorkerProvider.asyncFnMover(function calc(data: WorkerMessage) {
            let payload = data.payload;
            const channel = data.channel;
            payload++;
            return Promise.resolve({
                channel,
                payload,
            });
        }));
        const messages = [
            [{
                channel: "test",
                payload: 1,
            }],
            [{
                channel: "test1",
                payload: 1,
            }],
            [{
                channel: "test",
                payload: 1,
            }],
            [{
                channel: "test",
                payload: 1,
            }],
            [{
                channel: "test2",
                payload: 1,
            }],
        ] as WorkerMessages[];
        wp.messages = ([] as WorkerMessages[]).concat(messages);
        wp.removeMessagesByChannel("test");
        expect(wp.messages[0]).toEqual(messages[1]);
        wp.removeMessage(messages[1][0]);
        expect(wp.messages.length).toBe(1);
        wp.removeMessage(messages[1][0]);
        expect(wp.messages.length).toBe(1);
    });
})