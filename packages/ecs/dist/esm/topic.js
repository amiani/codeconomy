import { mutableEmpty } from "@javelin/core";
/**
 * The utility method used to create a topic, consumes a type parameter
 * and a name and returns an object that conforms to the topic type
 */
export const createTopic = () => {
    const staged = [];
    const ready = [];
    const push = (event) => staged.push(event);
    const pushImmediate = (event) => ready.push(event);
    const flush = () => {
        mutableEmpty(ready);
        const len = staged.length;
        for (let i = len - 1; i >= 0; i--) {
            ready[i] = staged.pop();
        }
    };
    const clear = () => {
        mutableEmpty(staged);
        mutableEmpty(ready);
    };
    return {
        *[Symbol.iterator]() {
            for (let i = 0; i < ready.length; i++) {
                yield ready[i];
            }
        },
        push,
        pushImmediate,
        flush,
        clear,
    };
};
//# sourceMappingURL=topic.js.map