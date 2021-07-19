import { unpackSparseArray } from "@javelin/core";
function createArchetypeState(options) {
    const snapshot = "snapshot" in options ? options.snapshot : null;
    const entities = snapshot ? Object.keys(snapshot.indices).map(Number) : [];
    const indices = snapshot ? unpackSparseArray(snapshot.indices) : [];
    const signature = ("signature" in options ? options.signature : options.snapshot.signature)
        .slice()
        .sort((a, b) => a - b);
    const table = (snapshot
        ? snapshot.table.map(column => column.slice())
        : signature.map(() => []));
    const signatureInverse = signature.reduce((a, x, i) => {
        a[x] = i;
        return a;
    }, []);
    return { entities, indices, signature, signatureInverse, table };
}
/**
 * Create an Archetype.
 *
 * @param signature Array of component types that make up the archetype
 * @param table  Initial component data
 */
export function createArchetype(options) {
    const { signature, signatureInverse, entities, indices, table } = createArchetypeState(options);
    function insert(entity, components) {
        for (let i = 0; i < components.length; i++) {
            const component = components[i];
            const schemaIndex = signatureInverse[component.__type__];
            table[schemaIndex].push(component);
        }
        indices[entity] = entities.push(entity) - 1;
    }
    function remove(entity) {
        const length = entities.length;
        const index = indices[entity];
        const head = entities.pop();
        delete indices[entity];
        if (index === length - 1) {
            for (const column of table)
                column.pop();
        }
        else {
            // Move leading entity's components to removed index position
            for (const column of table) {
                column[index] = column.pop();
            }
            // Move leading entity to removed index position
            entities[index] = head;
            // Update previously leading entity's index
            indices[head] = index;
        }
    }
    return {
        entities,
        indices,
        insert,
        remove,
        signature,
        signatureInverse,
        table,
    };
}
//# sourceMappingURL=archetype.js.map