export declare type CompareFunction<T> = (a: T, b: T) => number;
export declare class Comparator<T> {
    compare: CompareFunction<T>;
    constructor(compareFunction?: CompareFunction<T>);
    static defaultCompareFunction(a: unknown, b: unknown): 0 | 1 | -1;
    equal(a: T, b: T): boolean;
    lessThan(a: T, b: T): boolean;
    greaterThan(a: T, b: T): boolean;
    lessThanOrEqual(a: T, b: T): boolean;
    greaterThanOrEqual(a: T, b: T): boolean;
    reverse(): void;
}
//# sourceMappingURL=comparator.d.ts.map