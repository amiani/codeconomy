"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSignal = void 0;
const core_1 = require("@javelin/core");
const createSignal = () => {
    const subscribers = [];
    const subscribe = (subscriber) => {
        subscribers.push(subscriber);
        return () => core_1.mutableRemoveUnordered(subscribers, subscriber);
    };
    const dispatch = (t, t2, t3, t4) => {
        for (let i = 0; i < subscribers.length; i++) {
            subscribers[i](t, t2, t3, t4);
        }
    };
    return {
        subscribe,
        dispatch,
    };
};
exports.createSignal = createSignal;
//# sourceMappingURL=signal.js.map