export declare function mutableRemoveUnordered<T>(arr: T[], element: T): boolean;
export declare function mutableRemoveByIndexUnordered<T>(arr: T[], index: number): boolean;
export declare function mutableRemove<T>(arr: T[], element: T): boolean;
export declare function mutableEmpty<T extends unknown[]>(arr: T): T;
export declare function createArray<T = void>(len?: number, f?: (i: number) => T): T[];
export declare type PackedSparseArray<T> = {
    [key: number]: T;
};
export declare function packSparseArray<T>(array: readonly T[]): PackedSparseArray<T>;
export declare function unpackSparseArray<T>(packedSparseArray: PackedSparseArray<T>): T[];
//# sourceMappingURL=array.d.ts.map