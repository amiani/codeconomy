"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTopic = void 0;
const core_1 = require("@javelin/core");
/**
 * The utility method used to create a topic, consumes a type parameter
 * and a name and returns an object that conforms to the topic type
 */
const createTopic = () => {
    const staged = [];
    const ready = [];
    const push = (event) => staged.push(event);
    const pushImmediate = (event) => ready.push(event);
    const flush = () => {
        core_1.mutableEmpty(ready);
        const len = staged.length;
        for (let i = len - 1; i >= 0; i--) {
            ready[i] = staged.pop();
        }
    };
    const clear = () => {
        core_1.mutableEmpty(staged);
        core_1.mutableEmpty(ready);
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
exports.createTopic = createTopic;
//# sourceMappingURL=topic.js.map