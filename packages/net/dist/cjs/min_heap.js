"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MinHeap = void 0;
const heap_1 = require("./heap");
class MinHeap extends heap_1.Heap {
    pairIsInCorrectOrder(elementA, elementB) {
        return this.compare.lessThanOrEqual(elementA, elementB);
    }
}
exports.MinHeap = MinHeap;
//# sourceMappingURL=min_heap.js.map