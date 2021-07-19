import { assert, mutableEmpty, packSparseArray } from "@javelin/core";
import { createArchetype } from "./archetype";
import { UNSAFE_internals } from "./internal";
import { createSignal } from "./signal";
const ERROR_ENTITY_NOT_CREATED = "Failed to locate entity: entity has not been created";
const ERROR_ALREADY_DESTROYED = "Failed to locate entity: entity has been destroyed";
const ERROR_NO_SCHEMA = "Failed to locate component: schema not registered";
export function createStorage(options = {}) {
    const archetypes = options.snapshot
        ? options.snapshot.archetypes.map(snapshot => createArchetype({ snapshot }))
        : [createArchetype({ signature: [] })];
    const entityIndex = [];
    const entityRelocating = createSignal();
    const entityRelocated = createSignal();
    const archetypeCreated = createSignal();
    function findArchetype(components) {
        const length = components.length;
        outer: for (let i = 0; i < archetypes.length; i++) {
            const archetype = archetypes[i];
            const { signature, signatureInverse } = archetype;
            if (signature.length !== length) {
                continue;
            }
            for (let j = 0; j < length; j++) {
                if (signatureInverse[components[j].__type__] === undefined) {
                    continue outer;
                }
            }
            return archetype;
        }
        return null;
    }
    function findOrCreateArchetype(components) {
        let archetype = findArchetype(components);
        if (archetype === null) {
            archetype = createArchetype({
                signature: components.map(c => c.__type__),
            });
            archetypes.push(archetype);
            archetypeCreated.dispatch(archetype);
        }
        return archetype;
    }
    function getEntityArchetype(entity) {
        const archetype = entityIndex[entity];
        assert(archetype !== undefined, ERROR_ENTITY_NOT_CREATED);
        assert(archetype !== null, ERROR_ALREADY_DESTROYED);
        return archetype;
    }
    function relocate(prev, entity, components, changed) {
        const next = findOrCreateArchetype(components);
        entityRelocating.dispatch(entity, prev, next, changed);
        prev.remove(entity);
        next.insert(entity, components);
        entityIndex[entity] = next;
        entityRelocated.dispatch(entity, prev, next, changed);
    }
    function attachComponents(entity, components) {
        const source = entityIndex[entity];
        if (source === undefined || source === null) {
            const archetype = findOrCreateArchetype(components);
            entityRelocating.dispatch(entity, archetypes[0], archetype, components);
            archetype.insert(entity, components);
            entityIndex[entity] = archetype;
            entityRelocated.dispatch(entity, archetypes[0], archetype, components);
        }
        else {
            const index = source.indices[entity];
            const final = components.slice();
            for (let i = 0; i < source.signature.length; i++) {
                const schemaId = source.signature[i];
                if (components.find(c => c.__type__ === schemaId)) {
                    // take inserted component
                    continue;
                }
                final.push(source.table[i][index]);
            }
            relocate(source, entity, final, components);
        }
    }
    function detachBySchemaId(entity, schemaIds) {
        const source = getEntityArchetype(entity);
        const removed = [];
        const final = [];
        const index = source.indices[entity];
        for (let i = 0; i < source.signature.length; i++) {
            const type = source.signature[i];
            const component = source.table[i][index];
            (schemaIds.includes(type) ? removed : final).push(component);
        }
        relocate(source, entity, final, removed);
    }
    function clearComponents(entity) {
        const archetype = getEntityArchetype(entity);
        detachBySchemaId(entity, archetype.signature);
        entityIndex[entity] = null;
    }
    const tmpComponentsToInsert = [];
    function attachOrUpdateComponents(entity, components) {
        const archetype = getEntityArchetype(entity);
        const index = archetype.indices[entity];
        mutableEmpty(tmpComponentsToInsert);
        for (let i = 0; i < components.length; i++) {
            const component = components[i];
            const column = archetype.signatureInverse[component.__type__];
            if (column === undefined) {
                // Entity component makeup does not match patch component, insert the new
                // component.
                tmpComponentsToInsert.push(component);
            }
            else {
                // Apply patch to component.
                Object.assign(archetype.table[column][index], component);
            }
        }
        if (tmpComponentsToInsert.length > 0) {
            attachComponents(entity, tmpComponentsToInsert);
        }
    }
    function hasComponentOfSchema(entity, schema) {
        const archetype = getEntityArchetype(entity);
        const type = UNSAFE_internals.schemaIndex.get(schema);
        assert(type !== undefined, ERROR_NO_SCHEMA);
        return archetype.signature.includes(type);
    }
    function getComponentBySchema(entity, schema) {
        const type = UNSAFE_internals.schemaIndex.get(schema);
        assert(type !== undefined, ERROR_NO_SCHEMA);
        return getComponentBySchemaId(entity, type);
    }
    function getComponentBySchemaId(entity, schemaId) {
        const archetype = getEntityArchetype(entity);
        const column = archetype.signatureInverse[schemaId];
        if (column === undefined) {
            return null;
        }
        const entityIndex = archetype.indices[entity];
        return archetype.table[column][entityIndex];
    }
    function getAllComponents(entity) {
        const archetype = getEntityArchetype(entity);
        const entityIndex = archetype.indices[entity];
        const result = [];
        for (let i = 0; i < archetype.table.length; i++) {
            result.push(archetype.table[i][entityIndex]);
        }
        return result;
    }
    function clear() {
        mutableEmpty(archetypes);
        mutableEmpty(entityIndex);
    }
    function getSnapshot() {
        return {
            archetypes: archetypes.map(archetype => ({
                signature: archetype.signature.slice(),
                table: archetype.table.map(column => column.map(component => ({ ...component }))),
                indices: packSparseArray(archetype.indices),
            })),
        };
    }
    return {
        archetypeCreated,
        archetypes,
        attachComponents,
        attachOrUpdateComponents,
        reset: clear,
        clearComponents,
        detachBySchemaId,
        entityRelocated,
        entityRelocating,
        getComponentBySchemaId,
        getComponentBySchema,
        getAllComponents,
        getSnapshot,
        hasComponentOfSchema,
    };
}
//# sourceMappingURL=storage.js.map