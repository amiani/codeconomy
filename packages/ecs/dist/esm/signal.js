import { mutableRemoveUnordered } from "@javelin/core";
export const createSignal = () => {
    const subscribers = [];
    const subscribe = (subscriber) => {
        subscribers.push(subscriber);
        return () => mutableRemoveUnordered(subscribers, subscriber);
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
//# sourceMappingURL=signal.js.map