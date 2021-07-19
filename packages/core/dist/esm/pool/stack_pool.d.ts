export declare type StackPool<T> = {
    allocate(): void;
    retain(): T;
    release(obj: T): void;
};
export declare function createStackPool<T>(type: (pool: StackPool<T>) => T, reset: (obj: T) => T, size: number): StackPool<T>;
//# sourceMappingURL=stack_pool.d.ts.map