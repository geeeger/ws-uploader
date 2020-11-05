/**
 * copy from axios
 * 截断器，当钩子用，用以侵入式替换部分功能
 */
export default class InterceptorManager<Tfulfilled, Trejected> {
    handlers: {
        fulfilled?: Tfulfilled
        rejected?: Trejected
        name?: string
    }[] = []

    use(fulfilled?: Tfulfilled, rejected?: Trejected, alias = '') {
        this.handlers.push({
            fulfilled,
            rejected,
            name: alias
        });
    }

    replace(name: string, fulfilled?: Tfulfilled, rejected?: Trejected) {
        for (let index = 0; index < this.handlers.length; index++) {
            const element = this.handlers[index];
            if (element.name === name) {
                element.fulfilled = fulfilled;
                element.rejected = rejected;
                return;
            }
        }
    }

    forEach(fn: (interceptor: {
        fulfilled?: Tfulfilled
        rejected?: Trejected
    }) => any) {
        this.handlers.forEach(fn)
    }
}