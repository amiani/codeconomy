import { World } from "./world";
/**
 * The effect executor is a function type that captures the return value and
 * an arbitrary list of arguments.
 */
export declare type EffectExecutor<S, A extends unknown[]> = (...args: A) => S;
/**
 * The effect's API is the contract that the effect and system operate under.
 * It extends the interface of the effect executor by also unwrapping resolved
 * promise values.
 */
export declare type EffectApi<S, A extends unknown[]> = EffectExecutor<UnwrappedEffectState<S>, A>;
/**
 * An effect factory is a function that creates an effect. It is executed for
 * each instance of an effect in a system, unless the effect is configured to
 * be `shared`, in which case it is executed only once during the lifetime of
 * the application. It accepts a world instance as its only parameter and
 * returns an effect executor. The executor can utilize the factory closure to
 * implement local state that persists between calls.
 * @example <caption>local state</caption>
 * const factory: EffectFactory<number> = () => {
 *   let i = 0;
 *   return () => i++
 * }
 */
export declare type EffectFactory<S, A extends unknown[] = [], T = unknown> = (world: World<T>) => EffectExecutor<S, A>;
export declare type EffectOptions = {
    /**
     * Limit this effect to a single instance that will be executed a maximum of
     * once per tick and share its state across all consumers.
     * @example
     * const useObject = createEffect(() => () => ({}), { shared: true })
     * // in a system:
     * assert(useObject() === useObject())
     */
    shared?: boolean;
};
declare type UnwrappedEffectState<S> = S extends Promise<infer PS> ? PS | null : S;
/**
 * Create an effect by specifying an effect factory and optional configuration
 * options.
 *
 * An effect is a stateful function that is used to implement logic in systems
 * without use of singleton components or global state. Each function has
 * access to a closure (the factory) that is used to implement local variables
 * that persist between steps of the world. Effects are called just like normal
 * functions within systems. Javelin automatically resolves the correct closure
 * based on the order the effect is called in within a system.
 *
 * @example
 * const useCounter = createEffect(() => {
 *   // closure
 *   let i = 0
 *   return (base: number) => base + i++
 * })
 * // in a system:
 * // (step 0)
 * const a = useCounter(0)  // 0
 * const b = useCounter(10) // 10
 * // (step 1)
 * const a = useCounter(0)  // 1
 * const b = useCounter(10) // 11
 */
export declare function createEffect<S = unknown, A extends unknown[] = [], W extends unknown = void>(factory: EffectFactory<S, A, W>, options?: EffectOptions): EffectApi<S, A>;
export {};
//# sourceMappingURL=effect.d.ts.map