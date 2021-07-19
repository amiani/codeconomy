import { CollatedNode, CollatedNodeSchema, Field, FieldArray, FieldBoolean, FieldData, FieldDynamic, FieldExtract, FieldMap, FieldNumber, FieldObject, FieldOf, FieldPrimitive, FieldSet, FieldString, Model, Schema } from "./model";
/**
 * Object used in a schema to declare a numeric field.
 * @example
 * const Wallet = { money: number }
 */
export declare const number: FieldNumber;
/**
 * Object used in a schema to declare a string field.
 * @example
 * const Book = { title: string }
 */
export declare const string: FieldString;
/**
 * Object used in a schema to declare a boolean field.
 * @example
 * const Controller = { jumping: boolean }
 */
export declare const boolean: FieldBoolean;
/**
 * Build a field that represents an array within a schema. The sole parameter
 * defines the array's element type, which can be another field or Schema.
 * @example <caption>primitive element</caption>
 * const Bag = { items: arrayOf(number) }
 * @example <caption>complex element</caption>
 * const Shape = { vertices: arrayOf(arrayOf(number)) }
 */
export declare function arrayOf<T extends Field | Schema>(element: T): FieldArray<FieldExtract<T>>;
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
export declare function objectOf<T extends Field | Schema>(element: T, key?: FieldString): FieldObject<FieldExtract<T>>;
/**
 * Build a field that represents an Set within a schema. The sole parameter
 * defines the Set's element type, which can be another field or Schema.
 * @example <caption>primitive element</caption>
 * const Buffs = { values: setOf(number) }
 * @example <caption>complex element</caption>
 * const Body = { colliders: setOf(Collider) }
 */
export declare function setOf<T extends Field | Schema>(element: T): FieldSet<FieldExtract<T>>;
/**
 * Build a field that represents an Map within a schema. The first parameter
 * defines the Map's key type, which must be a primitive field. The second
 * argument defines the Map's value type, which can be a field or schema.
 * @example <caption>primitive element</caption>
 * const Disabled = { entities: mapOf(number, boolean) }
 * @example <caption>complex element</caption>
 * const PrivateChat = { messagesByClientId: mapOf(string, arrayOf(ChatMessage)) }
 */
export declare function mapOf<K, V extends Field | Schema>(key: FieldOf<K>, element: V): FieldMap<K, FieldExtract<V>>;
/**
 * Build a field that represents an unknown type in a schema. Accepts an
 * optional parameter which is a factory function that returns an initial
 * value for each field.
 * @example <caption>`unknown` type</caption>
 * const RigidBody = { value: dynamic() }
 * @example <caption>library type</caption>
 * const RigidBody = { value: dynamic(() => new Rapier.RigidBody()) }
 */
export declare function dynamic<T>(get?: FieldData<T>["get"]): FieldDynamic<T>;
/**
 * Determine if an object is a Javelin model field.
 */
export declare function isField<T>(object: object): object is FieldData<T>;
/**
 * Determine if an object is a primitive Javelin model field.
 */
export declare function isPrimitiveField(object: object): object is FieldPrimitive;
/**
 * Determine if a Javelin model node represents a schema.
 */
export declare function isSchema<T>(node: CollatedNode<T>): node is CollatedNodeSchema<T>;
/**
 * Determine if a Javelin model node is simple. A node is simple if:
 *   1. it is primitive
 *   2. it is a schema and each of its fields are primitive
 *   3. it is a complex field (e.g. array, map) and its element is primitive
 */
export declare function isSimple(node: CollatedNode): boolean;
declare type ModelConfig = Map<number, Schema | Field>;
/**
 * Produce a graph from a model and assign each writable field a unique integer
 * id.
 */
export declare function createModel<T>(config: ModelConfig): Model<T>;
/**
 * Create an instance of a schema.
 */
export declare function createSchemaInstance<T extends Schema>(schema: T, object?: FieldExtract<T>): FieldExtract<T>;
/**
 * Reset an instance of a schema.
 */
export declare function resetSchemaInstance<T extends Schema>(object: FieldExtract<T>, schema: T): FieldExtract<T>;
export {};
//# sourceMappingURL=model_helpers.d.ts.map