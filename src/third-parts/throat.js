/* eslint-disable prefer-rest-params */
/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable @typescript-eslint/explicit-function-return-type */


function Delayed(resolve, fn, self, args) {
    this.resolve = resolve;
    this.fn = fn;
    this.self = self || null;
    this.args = args;
}

function Queue() {
    this._s1 = [];
    this._s2 = [];
}

Queue.prototype.push = function (value) {
    this._s1.push(value);
};

Queue.prototype.shift = function () {
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
};

Queue.prototype.isEmpty = function () {
    return !this._s1.length && !this._s2.length;
};

export default function throat (PromiseArgument) {
    let Promise;
    function throat(size, fn) {
        const queue = new Queue();
        function run(fn, self, args) {
            if (size) {
                size--;
                const result = new Promise(function (resolve) {
                    resolve(fn.apply(self, args));
                });
                result.then(release, release);
                return result;
            } else {
                return new Promise(function (resolve) {
                    queue.push(new Delayed(resolve, fn, self, args));
                });
            }
        }
        function release() {
            size++;
            if (!queue.isEmpty()) {
                const next = queue.shift();
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
                return run(fn, this, args);
            };
        } else {
            return function (fn) {
                if (typeof fn !== 'function') {
                    throw new TypeError(
                        'Expected throat fn to be a function but got ' + typeof fn
                    );
                }
                const args = [];
                for (let i = 1; i < arguments.length; i++) {
                    args.push(arguments[i]);
                }
                return run(fn, this, args);
            };
        }
    }
    if (arguments.length === 1 && typeof PromiseArgument === 'function') {
        Promise = PromiseArgument;
        return throat;
    } else {
        if (typeof Promise !== 'function') {
            throw new Error(
                'You must provide a Promise polyfill for this library to work in older environments'
            );
        }
        return throat(arguments[0], arguments[1]);
    }
};
