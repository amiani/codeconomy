import { FieldExtract, Schema, StackPool } from "@javelin/core";
declare type ComponentProps = {
    readonly __type__: number;
};
export declare type ComponentOf<S extends Schema> = ComponentProps & FieldExtract<S>;
export declare type ComponentsOf<C extends Schema[]> = {
    [K in keyof C]: C[K] extends Schema ? ComponentOf<C[K]> : never;
};
export declare type Component = ComponentOf<Schema>;
/**
 * Determine if a component is an instance of the specified component type.
 * @param component
 * @param schema
 * @returns
 * @example
 * const A = {}
 * const B = {}
 * const a = component(A)
 * isComponentOf(a, A) // true
 * isComponentOf(a, B) // false
 */
export declare function isComponentOf<S extends Schema>(component: Component, schema: S): component is ComponentOf<S>;
export declare function createComponentPool<S extends Schema>(Schema: S, poolSize: number): StackPool<ComponentOf<S>>;
/**
 * Manually register a Schema as a component type. Optionally specify an id and
 * size for the component type's object pool.
 * @param schema
 * @param schemaId
 * @param [poolSize=1000]
 * @returns
 * @example <caption>register a schema as a component type</caption>
 * ```ts
 * const Vehicle = { torque: number }
 * registerSchema(Vehicle)
 * ```
 * @example <caption>register a schema with a fixed id</caption>
 * ```ts
 * const Vehicle = { torque: number }
 * registerSchema(Vehicle, 22)
 * ```
 * @example <caption>register a schema with a fixed id and pool size</caption>
 * ```ts
 * const Particle = { color: number }
 * registerSchema(Particle, 3, 10_000)
 * ```
 */
export declare function registerSchema(schema: Schema, schemaId?: number, poolSize?: number): number;
/**
 * Use a Schema to create a component. The second parameter is an optional
 * object that will be used to assign initial values to the new component
 * instance.
 * @param schema
 * @param props
 * @returns
 * @example
 * ```ts
 * const Quaternion = { x: number, y: number, z: number, w: number }
 * const q = component(Quaternion, { w: 1 })
 * ```
 */
export declare function component<S extends Schema>(schema: S, props?: Partial<FieldExtract<S>>): ComponentOf<S>;
export {};
//# sourceMappingURL=component.d.ts.map