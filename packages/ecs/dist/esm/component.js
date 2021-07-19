import { createModel, createStackPool, createSchemaInstance, resetSchemaInstance, } from "@javelin/core";
import { UNSAFE_internals, UNSAFE_setModel } from "./internal";
let schemaIds = 0;
function createComponentBase(schema) {
    return Object.defineProperties({}, {
        __type__: {
            value: UNSAFE_internals.schemaIndex.get(schema),
            writable: false,
            enumerable: true,
        },
    });
}
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
export function isComponentOf(component, schema) {
    return component.__type__ === UNSAFE_internals.schemaIndex.get(schema);
}
export function createComponentPool(Schema, poolSize) {
    const componentPool = createStackPool(() => createSchemaInstance(Schema, createComponentBase(Schema)), component => resetSchemaInstance(component, Schema), poolSize);
    return componentPool;
}
const modelConfig = new Map();
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
export function registerSchema(schema, schemaId, poolSize = 1000) {
    let type = UNSAFE_internals.schemaIndex.get(schema);
    if (type !== undefined) {
        return type;
    }
    type = schemaId;
    if (type === undefined) {
        while (modelConfig.has(schemaIds)) {
            schemaIds++;
        }
        type = schemaIds;
    }
    else if (modelConfig.has(type)) {
        throw new Error("Failed to register component type: a component with same id is already registered");
    }
    UNSAFE_internals.schemaPools.set(type, createComponentPool(schema, poolSize));
    modelConfig.set(type, schema);
    UNSAFE_internals.schemaIndex.set(schema, type);
    UNSAFE_setModel(createModel(modelConfig));
    return type;
}
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
export function component(schema, props) {
    const type = registerSchema(schema);
    const instance = UNSAFE_internals.schemaPools.get(type).retain();
    if (props !== undefined) {
        Object.assign(instance, props);
    }
    return instance;
}
//# sourceMappingURL=component.js.map