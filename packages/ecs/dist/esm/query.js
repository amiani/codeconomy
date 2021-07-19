import { assert, createStackPool, ErrorType, mutableEmpty, } from "@javelin/core";
import { registerSchema } from "./component";
import { UNSAFE_internals } from "./internal";
import { typeIsSuperset } from "./type";
const ERROR_MSG_UNBOUND_QUERY = "a query must be executed within a system or bound to a world using Query.bind()";
/**
 * Determine if a query signature (type) matches an archetype signature,
 * accounting for query filters (if any).
 */
function matches(type, filters, archetype) {
    return (typeIsSuperset(archetype.signature, type) &&
        archetype.signature.every(c => !filters.not.has(c)));
}
function createQueryInternal(options) {
    const length = options.select.length;
    const filters = options.filters ?? { not: new Set() };
    const signature = options.select
        .map(schema => registerSchema(schema))
        .sort((a, b) => a - b);
    const layout = (options.include ?? options.select).map((schema) => registerSchema(schema));
    const recordsIndex = [];
    const pool = createStackPool(() => [], components => {
        mutableEmpty(components);
        return components;
    }, 1000);
    let context = options.context;
    /**
     * Attempt to register an archetype with this query. If the archetype is
     * matched, a live record of the archetype's entities, columns, and entity
     * index is pushed into the query's registry.
     */
    function maybeRegisterArchetype(archetype, records) {
        if (matches(signature, filters, archetype)) {
            const columns = layout.map(schemaId => archetype.table[archetype.signature.indexOf(schemaId)]);
            records.push([
                archetype.entities,
                columns,
                archetype.indices,
            ]);
        }
    }
    /**
     * Create a new index of archetype records for the provided world, attempt
     * register existing archetypes, and subscribe to newly created ones.
     */
    function registerWorld(worldId) {
        const world = UNSAFE_internals.worlds[worldId];
        const records = [];
        recordsIndex[worldId] = records;
        world.storage.archetypes.forEach(archetype => maybeRegisterArchetype(archetype, records));
        world.storage.archetypeCreated.subscribe(archetype => maybeRegisterArchetype(archetype, records));
        return records;
    }
    function forEach(iteratee) {
        const c = context ?? UNSAFE_internals.currentWorldId;
        assert(c !== null && c !== -1, ERROR_MSG_UNBOUND_QUERY, ErrorType.Query);
        const records = recordsIndex[c] || registerWorld(c);
        const components = pool.retain();
        for (let i = 0; i < records.length; i++) {
            const [entities, columns] = records[i];
            for (let j = 0; j < entities.length; j++) {
                for (let k = 0; k < length; k++) {
                    components[k] = columns[k][j];
                }
                iteratee(entities[j], components);
            }
        }
        pool.release(components);
    }
    function iterator() {
        const c = context ?? UNSAFE_internals.currentWorldId;
        assert(c !== null && c !== -1, ERROR_MSG_UNBOUND_QUERY, ErrorType.Query);
        const iterator = (recordsIndex[c] || registerWorld(c))[Symbol.iterator]();
        return iterator;
    }
    function not(...exclude) {
        return createQueryInternal({
            ...options,
            filters: {
                not: new Set(exclude
                    .map(schema => UNSAFE_internals.schemaIndex.get(schema))
                    .filter((x) => typeof x === "number")),
            },
        });
    }
    function select(...include) {
        return createQueryInternal({
            ...options,
            include,
        });
    }
    function get(entity, out = []) {
        const c = context ?? UNSAFE_internals.currentWorldId;
        const records = recordsIndex[c];
        for (let i = 0; i < records.length; i++) {
            const [, columns, indices] = records[i];
            const index = indices[entity];
            if (index !== undefined) {
                for (let i = 0; i < columns.length; i++) {
                    out[i] = columns[i][index];
                }
                return out;
            }
        }
        throw new Error("Failed to get components of query: entity does not match query");
    }
    function bind(world) {
        return createQueryInternal({
            ...options,
            context: world.id,
        });
    }
    function test(entity) {
        const c = context ?? UNSAFE_internals.currentWorldId;
        const records = recordsIndex[c];
        for (let i = 0; i < records.length; i++) {
            const record = records[i];
            if (record[2][entity] !== undefined) {
                return true;
            }
        }
        return false;
    }
    function matchesArchetype(archetype) {
        return matches(signature, filters, archetype);
    }
    function equals(query) {
        if (query.signature.length !== signature.length) {
            return false;
        }
        for (let i = 0; i < query.signature.length; i++) {
            if (query.signature[i] !== signature[i]) {
                return false;
            }
        }
        if (query.filters.not.size !== filters.not.size) {
            return false;
        }
        let result = true;
        query.filters.not.forEach(schemaId => (result = result && filters.not.has(schemaId)));
        return result;
    }
    function match(components, out = []) {
        for (let i = 0; i < layout.length; i++) {
            out[i] = null;
        }
        for (let i = 0; i < components.length; i++) {
            const component = components[i];
            const index = layout.indexOf(component.__type__);
            if (index !== -1) {
                out[index] = component;
            }
        }
        return out;
    }
    const query = forEach;
    query[Symbol.iterator] = iterator;
    query.signature = signature;
    query.filters = filters;
    query.not = not;
    query.select = select;
    query.get = get;
    query.bind = bind;
    query.test = test;
    query.matchesArchetype = matchesArchetype;
    query.equals = equals;
    query.match = match;
    return query;
}
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
export function createQuery(...selector) {
    return createQueryInternal({
        select: selector,
    });
}
//# sourceMappingURL=query.js.map