import { mutableEmpty } from "../utils";
import { $flat, $kind, FieldKind, } from "./model";
/**
 * Object used in a schema to declare a numeric field.
 * @example
 * const Wallet = { money: number }
 */
export const number = {
    [$kind]: FieldKind.Number,
    get: () => 0,
};
/**
 * Object used in a schema to declare a string field.
 * @example
 * const Book = { title: string }
 */
export const string = {
    [$kind]: FieldKind.String,
    get: () => "",
};
/**
 * Object used in a schema to declare a boolean field.
 * @example
 * const Controller = { jumping: boolean }
 */
export const boolean = {
    [$kind]: FieldKind.Boolean,
    get: () => false,
};
/**
 * Build a field that represents an array within a schema. The sole parameter
 * defines the array's element type, which can be another field or Schema.
 * @example <caption>primitive element</caption>
 * const Bag = { items: arrayOf(number) }
 * @example <caption>complex element</caption>
 * const Shape = { vertices: arrayOf(arrayOf(number)) }
 */
export function arrayOf(element) {
    return {
        [$kind]: FieldKind.Array,
        get: (array = []) => mutableEmpty(array),
        element,
    };
}
/**
 * Build a field that represents an object within a schema. The first parameter
 * defines the object's element type, which can be another field or Schema. If
 * provided, the second argument will override the default key type of `string`
 * with another field derived from `string`.
 * @example <caption>primitive element</caption>
 * const Stats = { values: objectOf(number) }
 * @example <caption>`key` type override (e.g. for `@javelin/pack` encoding)</caption>
 * const Stat = { min: number, max: number, value: number }
 * const Stats = { values: objectOf(Stat, { ...string, length: 20 }) }
 */
export function objectOf(element, key = string) {
    return {
        [$kind]: FieldKind.Object,
        get: (object = {}) => {
            for (const prop in object) {
                delete object[prop];
            }
            return object;
        },
        key,
        element,
    };
}
/**
 * Build a field that represents an Set within a schema. The sole parameter
 * defines the Set's element type, which can be another field or Schema.
 * @example <caption>primitive element</caption>
 * const Buffs = { values: setOf(number) }
 * @example <caption>complex element</caption>
 * const Body = { colliders: setOf(Collider) }
 */
export function setOf(element) {
    return {
        [$kind]: FieldKind.Set,
        get: (set = new Set()) => {
            set.clear();
            return set;
        },
        element,
    };
}
/**
 * Build a field that represents an Map within a schema. The first parameter
 * defines the Map's key type, which must be a primitive field. The second
 * argument defines the Map's value type, which can be a field or schema.
 * @example <caption>primitive element</caption>
 * const Disabled = { entities: mapOf(number, boolean) }
 * @example <caption>complex element</caption>
 * const PrivateChat = { messagesByClientId: mapOf(string, arrayOf(ChatMessage)) }
 */
export function mapOf(key, element) {
    return {
        [$kind]: FieldKind.Map,
        get: (map = new Map()) => {
            map.clear();
            return map;
        },
        key,
        element,
    };
}
/**
 * Build a field that represents an unknown type in a schema. Accepts an
 * optional parameter which is a factory function that returns an initial
 * value for each field.
 * @example <caption>`unknown` type</caption>
 * const RigidBody = { value: dynamic() }
 * @example <caption>library type</caption>
 * const RigidBody = { value: dynamic(() => new Rapier.RigidBody()) }
 */
export function dynamic(get = () => null) {
    return {
        [$kind]: FieldKind.Dynamic,
        get,
    };
}
/**
 * Determine if an object is a Javelin model field.
 */
export function isField(object) {
    return $kind in object;
}
/**
 * Determine if an object is a primitive Javelin model field.
 */
export function isPrimitiveField(object) {
    if (!isField(object)) {
        return false;
    }
    const kind = object[$kind];
    return (kind === FieldKind.Number ||
        kind === FieldKind.String ||
        kind === FieldKind.Boolean ||
        kind === FieldKind.Dynamic);
}
/**
 * Determine if a Javelin model node represents a schema.
 */
export function isSchema(node) {
    return !($kind in node);
}
/**
 * Determine if a Javelin model node is simple. A node is simple if:
 *   1. it is primitive
 *   2. it is a schema and each of its fields are primitive
 *   3. it is a complex field (e.g. array, map) and its element is primitive
 */
export function isSimple(node) {
    if (isSchema(node)) {
        return node.fields.every(isPrimitiveField);
    }
    else if ("element" in node) {
        return isPrimitiveField(node.element);
    }
    return true;
}
/**
 * Create a recursively annotated schema where each field is uniquely
 * addressed by an integer id, indexed using `lo` and `hi` fields, and
 * annotated with useful metadata.
 */
function collate(visiting, cursor, traverse = []) {
    let base = {
        id: cursor.id,
        lo: cursor.id,
        hi: cursor.id,
        deep: traverse.length > 0,
        traverse,
    };
    cursor.id++;
    let node;
    if (isField(visiting)) {
        node = { ...base, ...visiting };
        if ("element" in node) {
            node.element = collate(node.element, cursor, "key" in node
                ? [...traverse, node.key]
                : traverse);
        }
    }
    else {
        const keys = Object.keys(visiting);
        const keysByFieldId = [];
        const fields = [];
        const fieldsByKey = {};
        const fieldIdsByKey = {};
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            const child = collate(visiting[key], cursor, traverse);
            keysByFieldId[child.id] = key;
            fieldsByKey[key] = child;
            fieldIdsByKey[key] = child.id;
            fields.push(child);
        }
        node = {
            ...base,
            keys,
            keysByFieldId,
            fields,
            fieldsByKey,
            fieldIdsByKey,
        };
    }
    node.hi = cursor.id;
    return node;
}
/**
 * Recursively flatten a model node, updating the `flat` argument with
 * key/value pairs where the key is a field id and the value is a its
 * corresponding model node.
 */
function flattenModelNode(node, flat) {
    flat[node.id] = node;
    if (isField(node)) {
        if ("element" in node) {
            flattenModelNode(node.element, flat);
        }
    }
    else {
        for (let i = 0; i < node.fields.length; i++) {
            flattenModelNode(node.fields[i], flat);
        }
    }
}
/**
 * Recursively flatten a model, creating a new object containing key/value
 * pairs where keys are field ids and values are corresponding model nodes.
 */
function flattenModel(model) {
    const flat = {};
    for (const prop in model) {
        flattenModelNode(model[prop], (flat[prop] = {}));
    }
    return flat;
}
/**
 * Produce a graph from a model and assign each writable field a unique integer
 * id.
 */
export function createModel(config) {
    const model = {};
    config.forEach((schema, t) => (model[t] = collate(schema, { id: 0 })));
    return Object.defineProperty(model, $flat, {
        enumerable: false,
        writable: false,
        value: flattenModel(model),
    });
}
/**
 * Create an instance of a schema.
 */
export function createSchemaInstance(schema, object = {}) {
    for (const prop in schema) {
        const type = schema[prop];
        let value;
        if (isField(type)) {
            value = type.get();
        }
        else {
            value = createSchemaInstance({}, type);
        }
        object[prop] = value;
    }
    return object;
}
/**
 * Reset an instance of a schema.
 */
export function resetSchemaInstance(object, schema) {
    for (const prop in schema) {
        const type = schema[prop];
        if (isField(type)) {
            object[prop] = type.get(object[prop]);
        }
        else {
            resetSchemaInstance(object[prop], type);
        }
    }
    return object;
}
//# sourceMappingURL=model_helpers.js.map