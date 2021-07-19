import { Patch, Component, Entity } from "@javelin/ecs";
import { ByteView, ModelEnhanced } from "@javelin/pack";
export declare const $buffer: unique symbol;
export declare type MessageOp = {
    data: unknown[];
    view: (ByteView | typeof $buffer)[];
    byteLength: number;
};
export declare function createOp(): MessageOp;
export declare function resetOp(op: MessageOp): MessageOp;
export declare const messageOpPool: import("@javelin/core").StackPool<MessageOp>;
export declare function insert(op: MessageOp, data: ArrayBuffer): number;
export declare function insert(op: MessageOp, data: unknown, view: ByteView): number;
export declare function modify(op: MessageOp, index: number, data: unknown): void;
/**
 * Create a snapshot message op.
 * @example
 * [
 *   entity: uint32,
 *   count: uint8,
 *   components: [schemaId: uint8, encoded: *][],
 * ]
 * @param entity
 * @param components
 * @returns MessageOp
 */
export declare function snapshot(model: ModelEnhanced, entity: Entity, components: Component[]): MessageOp;
/**
 * Create a patch message op.
 * [entity, schemaId, [field, traverse, [operation, ...args]*]*]
 * @param model
 * @param entity
 * @param schemaId
 * @param patch
 * @returns MessageOp
 */
export declare function patch(model: ModelEnhanced, entity: Entity, patch: Patch): MessageOp;
/**
 * Create a detach message op.
 * @example
 * [
 *   entity: uint32,
 *   count: uint8,
 *   schemaIds: uint8[],
 * ]
 * @param entity
 * @param schemaIds
 * @returns MessageOp
 */
export declare function detach(entity: Entity, schemaIds: number[]): MessageOp;
/**
 * Create a destroy message op.
 * @example
 * [
 *   entity: uint32,
 * ]
 * @param entity
 * @returns MessageOp
 */
export declare function destroy(entity: Entity): MessageOp;
/**
 * Create a model message op.
 * @example
 * [
 *   model: *,
 * ]
 * @param model
 * @returns MessageOp
 */
export declare function model(model: ModelEnhanced): MessageOp;
//# sourceMappingURL=message_op.d.ts.map