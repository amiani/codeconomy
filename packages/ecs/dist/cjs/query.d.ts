import { Schema } from "@javelin/core";
import { Archetype, ArchetypeTableColumn } from "./archetype";
import { Component, ComponentOf } from "./component";
import { Entity } from "./entity";
import { World } from "./world";
/**
 * A list of schemas that defines the signature of a query's results.
 * @example
 * const particle: Selector = [Position, Color]
 */
export declare type Selector = Schema[];
/**
 * An array of schema instances that corresponds to a selector.
 * @example
 * const results: SelectorResult<[Position, Color]> = [
 *   { x: 0, y: 0 },
 *   { value: 0xff0000 }
 * ]
 */
export declare type SelectorResult<S extends Selector> = {
    [K in keyof S]: S[K] extends Schema ? ComponentOf<S[K]> : Component;
};
/**
 * A "sparse" `SelectorResult` where each value can be null.
 * @example
 * const results: SelectorResultSparse<[Position, Color]> = [
 *   null,
 *   { value: 0xff0000 }
 * ]
 */
export declare type SelectorResultSparse<S extends Selector> = {
    [K in keyof S]: (S[K] extends Schema ? ComponentOf<S[K]> : Component) | null;
};
/**
 * A subset of selector `S`.
 * @example
 * const subset: SelectorSubset<[Position, Color]> = [Color]
 */
export declare type SelectorSubset<S extends Selector> = (S extends Array<infer _> ? _ : never)[];
/**
 * A record generated from an archetype with live references to the
 * archetype's entities and component data.
 */
export declare type QueryRecord<S extends Selector> = [
    entities: ReadonlyArray<number>,
    columns: {
        [K in keyof S]: S[K] extends Schema ? ArchetypeTableColumn<S[K]> : never;
    },
    entityLookup: ReadonlyArray<number>
];
/**
 * A function used to iterate a query using the `query(fn)` syntax.
 * @example
 * const iteratee: QueryIteratee<[Position, Color]> = (entity, [position, color]) => {
 *   // ...
 * }
 */
export declare type QueryIteratee<S extends Selector> = (entity: Entity, components: SelectorResult<S>) => unknown;
/**
 * A live-updating, iterable collection of entity-components records that match
 * a provided selector (list of schemas).
 */
export declare type Query<S extends Selector = Selector> = ((callback: QueryIteratee<S>) => void) & {
    signature: number[];
    filters: QueryFilters;
    [Symbol.iterator](): IterableIterator<QueryRecord<S>>;
    /**
     * Create a new query that excludes entities with components of provided
     * component type(s) from this query's results.
     */
    not(...selector: Selector): Query<S>;
    /**
     * Create a new query that behaves the same as this query, but yields a
     * specified subset of components.
     */
    select<T extends SelectorSubset<S>>(...include: T): Query<T>;
    /**
     * Get the results of a query for a specific entity.
     */
    get(entity: Entity, out?: SelectorResult<S>): SelectorResult<S>;
    /**
     * Determine if an entity matches the query.
     */
    test(entity: Entity): boolean;
    /**
     * Bind the results of this query to a specific world.
     */
    bind(world: World): Query<S>;
    /**
     * Determine if this query matches an archetype.
     */
    matchesArchetype(archetype: Archetype): boolean;
    /**
     * Determine if this query equals another query.
     */
    equals(query: Query): boolean;
    match(components: Component[], out?: SelectorResultSparse<S>): SelectorResultSparse<S>;
};
declare type QueryFilters = {
    not: Set<number>;
};
/**
 * Create a query that can be used to iterate entities that match a selector.
 * Maintains a live-updating cache of entities, and can be used across multiple
 * worlds.
 * @example
 * const burning = createQuery(Player, Burn)
 * burning.forEach((entity, [player, burn]) => {
 *   player.health -= burn.damage
 * })
 */
export declare function createQuery<S extends Selector>(...selector: S): Query<S>;
export {};
//# sourceMappingURL=query.d.ts.map