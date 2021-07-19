import { EffectOptions } from "./effect";
import { World } from "./world";
export declare type RefInitializer<T> = (world: World) => T;
export declare const createRef: <T>(initializer: RefInitializer<T>, options?: EffectOptions) => import("./effect").EffectApi<{
    value: T;
}, []>;
export declare function createImmutableRef<T>(initializer: RefInitializer<T>, options?: EffectOptions): import("./effect").EffectApi<T, []>;
//# sourceMappingURL=effect_utils.d.ts.map