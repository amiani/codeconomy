import { PackedSparseArray, Schema } from "@javelin/core";
import { Component, ComponentOf } from "./component";
import { Entity } from "./entity";
import { Type } from "./type";
export declare type ArchetypeTableColumn<S extends Schema> = ComponentOf<S>[];
export declare type ArchetypeTable<S extends Schema[]> = {
    readonly [K in keyof S]: ArchetypeTableColumn<S[K] extends Schema ? S[K] : never>;
};
export declare type ArchetypeData<T extends Schema[]> = {
    /**
     * Two-dimensional array of component type->component[] where each index
     * (column) of the component array corresponds to an entity.
     *
     *      (index)    0  1  2
     *     (entity)    1  3  9
     *   (Position) [[ p, p, p ]
     *   (Velocity) [  v, v, v ]]
     *
     * The index of each entity is tracked in the `indices` array.
     */
    readonly table: Readonly<ArchetypeTable<T>>;
    /**
     * Array where each value is a component type and the index is the column of
     * the type's collection in the archetype table.
     */
    readonly signature: Type;
};
export declare type ArchetypeSnapshot<T extends Schema[] = Schema[]> = ArchetypeData<T> & {
    indices: PackedSparseArray<number>;
};
/**
 * An Archetype is a collection of entities that share components of the same
 * type.
 */
export declare type Archetype<T extends Schema[] = Schema[]> = ArchetypeData<T> & {
    /**
     * Insert an entity into the Archetype.
     *
     * @param entity Subject entity
     * @param components Array of components
     * @returns void
     */
    insert(entity: Entity, components: Component[]): void;
    /**
     * Remove an entity from the Archetype.
     *
     * @param entity Subject entity
     * @returns void
     */
    remove(entity: Entity): void;
    /**
     * Array where each index is a component type and the corresponding index is
     * the component type's column index in the component table.
     */
    readonly signatureInverse: ReadonlyArray<number>;
    /**
     * Array of entities tracked by this archetype. Not used internally:
     * primarily a convenience for iteration/checks by consumers.
     */
    readonly entities: ReadonlyArray<Entity>;
    /**
     * Array where each index corresponds to an entity, and each value
     * corresponds to that entity's index in the component table. In the example
     * above, this array might look like:
     *
     *           1         3            9
     *   [empty, 0, empty, 1, empty x5, 2]
     *
     */
    readonly indices: ReadonlyArray<number>;
};
export declare type ArchetypeOptions<T extends Schema[]> = {
    signature: number[];
} | {
    snapshot: ArchetypeSnapshot<T>;
};
/**
 * Create an Archetype.
 *
 * @param signature Array of component types that make up the archetype
 * @param table  Initial component data
 */
export declare function createArchetype<T extends Schema[]>(options: ArchetypeOptions<T>): Archetype<T>;
//# sourceMappingURL=archetype.d.ts.map