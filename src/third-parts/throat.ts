/* eslint-disable prefer-rest-params */
/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable @typescript-eslint/explicit-function-return-type */


class Delayed {
    resolve: any;
    fn: any;
    self: null;
    args: any;
    constructor(resolve: any, fn: any, self: null, args: any) {
        this.resolve = resolve;
        this.fn = fn;
        this.self = self || null;
        this.args = args;
    }
}

class Queue {
    _s1: Delayed[];
    _s2: Delayed[];
    constructor() {
        this._s1 = [];
        this._s2 = [];
    }

    push(value: Delayed) {
        this._s1.push(value);
    }

    shift () {
        let s2 = this._s2;
        if (s2.length === 0) {
            const s1 = this._s1;
            if (s1.length === 0) {
                return;
            }
            this._s1 = s2;
            s2 = this._s2 = s1.reverse();
        }
        return s2.pop();
    }

    isEmpty () {
        return !this._s1.length && !this._s2.length;
    }
}

export default function throat () {
    function throat(size: any, fn: any) {
        const queue = new Queue();
        function run(fn: { apply: (arg0: any, arg1: any) => any; }, self: any, args: any[]) {
            if (size) {
                size--;
                const result = new Promise(function (resolve: (arg0: any) => void) {
                    resolve(fn.apply(self, args));
                });
                result.then(release, release);
                return result;
            } else {
                return new Promise(function (resolve: any) {
                    queue.push(new Delayed(resolve, fn, self, args));
                });
            }
        }
        function release() {
            size++;
            if (!queue.isEmpty()) {
                const next = queue.shift() as Delayed;
                next.resolve(run(next.fn, next.self, next.args));
            }
        }
        if (typeof size === 'function') {
            const temp = fn;
            fn = size;
            size = temp;
        }
        if (typeof size !== 'number') {
            throw new TypeError(
                'Expected throat size to be a number but got ' + typeof size
            );
        }
        if (fn !== undefined && typeof fn !== 'function') {
            throw new TypeError(
                'Expected throat fn to be a function but got ' + typeof fn
            );
        }
        if (typeof fn === 'function') {
            return function () {
                const args = [];
                for (let i = 0; i < arguments.length; i++) {
                    args.push(arguments[i]);
                }
                // @ts-ignore
                return run(fn, this, args);
            };
        } else {
            return function (fn: any) {
                if (typeof fn !== 'function') {
                    throw new TypeError(
                        'Expected throat fn to be a function but got ' + typeof fn
                    );
                }
                const args = [];
                for (let i = 1; i < arguments.length; i++) {
                    args.push(arguments[i]);
                }
                // @ts-ignore
                return run(fn, this, args);
            };
        }
    }
    return throat
}
