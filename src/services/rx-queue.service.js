'use strict';

const Rx = require('rxjs'),
    Observable = Rx.Observable;

let queues = {};

function Queue(name, interval) {
    this.arr = [];

    this.name = name;
    this.interval = interval;

    this.stream$ = Observable.create(observer => {
        Observable.interval(this.interval)
            .subscribe(() => {
                if (this.arr.length > 0) {
                    observer.next(this.arr.shift());
                }
            })
    });

    this.sendMessage = (data, metadata = '') => {
        this.arr.push({
            data: data,
            metadata: metadata
        })
    };

    this.getMessagesCount = () => {
        return this.arr.length;
    }
}

const createQueue = (name, interval) => {
    queues[name] = new Queue(name, interval);
    return queues[name];
};

const getQueue = (name) => {
    return queues[name]
};

module.exports = {
    createQueue: createQueue,
    getQueue: getQueue
};
