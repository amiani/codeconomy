"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.component = exports.registerSchema = exports.createComponentPool = exports.isComponentOf = void 0;
const core_1 = require("@javelin/core");
const internal_1 = require("./internal");
let schemaIds = 0;
function createComponentBase(schema) {
    return Object.defineProperties({}, {
        __type__: {
            value: internal_1.UNSAFE_internals.schemaIndex.get(schema),
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
function isComponentOf(component, schema) {
    return component.__type__ === internal_1.UNSAFE_internals.schemaIndex.get(schema);
}
exports.isComponentOf = isComponentOf;
function createComponentPool(Schema, poolSize) {
    const componentPool = core_1.createStackPool(() => core_1.createSchemaInstance(Schema, createComponentBase(Schema)), component => core_1.resetSchemaInstance(component, Schema), poolSize);
    return componentPool;
}
exports.createComponentPool = createComponentPool;
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
function registerSchema(schema, schemaId, poolSize = 1000) {
    let type = internal_1.UNSAFE_internals.schemaIndex.get(schema);
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
    internal_1.UNSAFE_internals.schemaPools.set(type, createComponentPool(schema, poolSize));
    modelConfig.set(type, schema);
    internal_1.UNSAFE_internals.schemaIndex.set(schema, type);
    internal_1.UNSAFE_setModel(core_1.createModel(modelConfig));
    return type;
}
exports.registerSchema = registerSchema;
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
function component(schema, props) {
    const type = registerSchema(schema);
    const instance = internal_1.UNSAFE_internals.schemaPools.get(type).retain();
    if (props !== undefined) {
        Object.assign(instance, props);
    }
    return instance;
}
exports.component = component;
//# sourceMappingURL=component.js.map