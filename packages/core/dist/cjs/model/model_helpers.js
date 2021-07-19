"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetSchemaInstance = exports.createSchemaInstance = exports.createModel = exports.isSimple = exports.isSchema = exports.isPrimitiveField = exports.isField = exports.dynamic = exports.mapOf = exports.setOf = exports.objectOf = exports.arrayOf = exports.boolean = exports.string = exports.number = void 0;
const utils_1 = require("../utils");
const model_1 = require("./model");
/**
 * Object used in a schema to declare a numeric field.
 * @example
 * const Wallet = { money: number }
 */
exports.number = {
    [model_1.$kind]: model_1.FieldKind.Number,
    get: () => 0,
};
/**
 * Object used in a schema to declare a string field.
 * @example
 * const Book = { title: string }
 */
exports.string = {
    [model_1.$kind]: model_1.FieldKind.String,
    get: () => "",
};
/**
 * Object used in a schema to declare a boolean field.
 * @example
 * const Controller = { jumping: boolean }
 */
exports.boolean = {
    [model_1.$kind]: model_1.FieldKind.Boolean,
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
function arrayOf(element) {
    return {
        [model_1.$kind]: model_1.FieldKind.Array,
        get: (array = []) => utils_1.mutableEmpty(array),
        element,
    };
}
exports.arrayOf = arrayOf;
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
function objectOf(element, key = exports.string) {
    return {
        [model_1.$kind]: model_1.FieldKind.Object,
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
exports.objectOf = objectOf;
/**
 * Build a field that represents an Set within a schema. The sole parameter
 * defines the Set's element type, which can be another field or Schema.
 * @example <caption>primitive element</caption>
 * const Buffs = { values: setOf(number) }
 * @example <caption>complex element</caption>
 * const Body = { colliders: setOf(Collider) }
 */
function setOf(element) {
    return {
        [model_1.$kind]: model_1.FieldKind.Set,
        get: (set = new Set()) => {
            set.clear();
            return set;
        },
        element,
    };
}
exports.setOf = setOf;
/**
 * Build a field that represents an Map within a schema. The first parameter
 * defines the Map's key type, which must be a primitive field. The second
 * argument defines the Map's value type, which can be a field or schema.
 * @example <caption>primitive element</caption>
 * const Disabled = { entities: mapOf(number, boolean) }
 * @example <caption>complex element</caption>
 * const PrivateChat = { messagesByClientId: mapOf(string, arrayOf(ChatMessage)) }
 */
function mapOf(key, element) {
    return {
        [model_1.$kind]: model_1.FieldKind.Map,
        get: (map = new Map()) => {
            map.clear();
            return map;
        },
        key,
        element,
    };
}
exports.mapOf = mapOf;
/**
 * Build a field that represents an unknown type in a schema. Accepts an
 * optional parameter which is a factory function that returns an initial
 * value for each field.
 * @example <caption>`unknown` type</caption>
 * const RigidBody = { value: dynamic() }
 * @example <caption>library type</caption>
 * const RigidBody = { value: dynamic(() => new Rapier.RigidBody()) }
 */
function dynamic(get = () => null) {
    return {
        [model_1.$kind]: model_1.FieldKind.Dynamic,
        get,
    };
}
exports.dynamic = dynamic;
/**
 * Determine if an object is a Javelin model field.
 */
function isField(object) {
    return model_1.$kind in object;
}
exports.isField = isField;
/**
 * Determine if an object is a primitive Javelin model field.
 */
function isPrimitiveField(object) {
    if (!isField(object)) {
        return false;
    }
    const kind = object[model_1.$kind];
    return (kind === model_1.FieldKind.Number ||
        kind === model_1.FieldKind.String ||
        kind === model_1.FieldKind.Boolean ||
        kind === model_1.FieldKind.Dynamic);
}
exports.isPrimitiveField = isPrimitiveField;
/**
 * Determine if a Javelin model node represents a schema.
 */
function isSchema(node) {
    return !(model_1.$kind in node);
}
exports.isSchema = isSchema;
/**
 * Determine if a Javelin model node is simple. A node is simple if:
 *   1. it is primitive
 *   2. it is a schema and each of its fields are primitive
 *   3. it is a complex field (e.g. array, map) and its element is primitive
 */
function isSimple(node) {
    if (isSchema(node)) {
        return node.fields.every(isPrimitiveField);
    }
    else if ("element" in node) {
        return isPrimitiveField(node.element);
    }
    return true;
}
exports.isSimple = isSimple;
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
function createModel(config) {
    const model = {};
    config.forEach((schema, t) => (model[t] = collate(schema, { id: 0 })));
    return Object.defineProperty(model, model_1.$flat, {
        enumerable: false,
        writable: false,
        value: flattenModel(model),
    });
}
exports.createModel = createModel;
/**
 * Create an instance of a schema.
 */
function createSchemaInstance(schema, object = {}) {
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
exports.createSchemaInstance = createSchemaInstance;
/**
 * Reset an instance of a schema.
 */
function resetSchemaInstance(object, schema) {
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
exports.resetSchemaInstance = resetSchemaInstance;
//# sourceMappingURL=model_helpers.js.map