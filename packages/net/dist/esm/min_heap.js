import { Heap } from "./heap";
export class MinHeap extends Heap {
    pairIsInCorrectOrder(elementA, elementB) {
        return this.compare.lessThanOrEqual(elementA, elementB);
    }
}
//# sourceMappingURL=min_heap.js.map