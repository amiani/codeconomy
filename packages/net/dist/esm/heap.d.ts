import { Comparator, CompareFunction } from "./comparator";
export declare class Heap<T> {
    heapContainer: T[];
    compare: Comparator<T>;
    constructor(comparatorFunction?: CompareFunction<T>);
    getLeftChildIndex(parentIndex: number): number;
    getRightChildIndex(parentIndex: number): number;
    getParentIndex(childIndex: number): number;
    hasParent(childIndex: number): boolean;
    hasLeftChild(parentIndex: number): boolean;
    hasRightChild(parentIndex: number): boolean;
    leftChild(parentIndex: number): T;
    rightChild(parentIndex: number): T;
    parent(childIndex: number): T;
    swap(indexOne: number, indexTwo: number): void;
    peek(): T | null;
    poll(): T | null;
    add(item: T): this;
    remove(item: T, comparator?: Comparator<T>): this;
    find(item: T, comparator?: Comparator<T>): number[];
    isEmpty(): boolean;
    toString(): string;
    heapifyUp(startIndex?: number): void;
    heapifyDown(customStartIndex?: number): void;
    pairIsInCorrectOrder(firstElement: T, secondElement: T): boolean;
}
//# sourceMappingURL=heap.d.ts.map