import { assert, mutableEmpty } from "@javelin/core";
import { registerSchema } from "./component";
import { UNSAFE_internals } from "./internal";
import { createStorage } from "./storage";
const $systemId = Symbol("javelin_system_id");
export var DeferredOpType;
(function (DeferredOpType) {
    DeferredOpType[DeferredOpType["Spawn"] = 0] = "Spawn";
    DeferredOpType[DeferredOpType["Attach"] = 1] = "Attach";
    DeferredOpType[DeferredOpType["Detach"] = 2] = "Detach";
    DeferredOpType[DeferredOpType["Mutate"] = 3] = "Mutate";
    DeferredOpType[DeferredOpType["Destroy"] = 4] = "Destroy";
})(DeferredOpType || (DeferredOpType = {}));
/**
 * Create a world.
 * @param options WorldOptions
 * @returns World
 */
export function createWorld(options = {}) {
    const { topics = [] } = options;
    const systems = [];
    const deferredOps = [];
    const destroyed = new Set();
    const storage = createStorage({ snapshot: options.snapshot?.storage });
    let entityIds = 0;
    let systemIds = 0;
    options.systems?.forEach(addSystem);
    function createDeferredOp(...args) {
        const deferred = [];
        for (let i = 0; i < args.length; i++) {
            deferred[i] = args[i];
        }
        return deferred;
    }
    function maybeReleaseComponent(component) {
        const pool = UNSAFE_internals.schemaPools.get(component.__type__);
        if (pool) {
            pool.release(component);
        }
    }
    function addSystem(system) {
        systems.push(system);
        system[$systemId] = systemIds++;
    }
    function removeSystem(system) {
        const index = systems.indexOf(system);
        if (index > -1) {
            systems.splice(index, 1);
        }
    }
    function addTopic(topic) {
        topics.push(topic);
    }
    function removeTopic(topic) {
        const index = topics.indexOf(topic);
        if (index > -1) {
            topics.splice(index, 1);
        }
    }
    function create(...components) {
        const entity = entityIds++;
        if (components.length > 0) {
            deferredOps.push(createDeferredOp(DeferredOpType.Attach, entity, components));
        }
        return entity;
    }
    function attach(entity, ...components) {
        deferredOps.push(createDeferredOp(DeferredOpType.Attach, entity, components));
    }
    function attachImmediate(entity, components) {
        storage.attachComponents(entity, components);
    }
    function detach(entity, ...components) {
        if (components.length === 0) {
            return;
        }
        const schemaIds = components.map(c => typeof c === "number"
            ? c
            : UNSAFE_internals.schemaIndex.get(c) ??
                c.__type__);
        deferredOps.push(createDeferredOp(DeferredOpType.Detach, entity, schemaIds));
    }
    function detachImmediate(entity, schemaIds) {
        const components = [];
        for (let i = 0; i < schemaIds.length; i++) {
            const schemaId = schemaIds[i];
            const component = storage.getComponentBySchemaId(entity, schemaId);
            assert(component !== null, `Failed to detach component: entity does not have component of type ${schemaId}`);
            components.push(component);
        }
        storage.detachBySchemaId(entity, schemaIds);
        components.forEach(maybeReleaseComponent);
    }
    function destroy(entity) {
        if (destroyed.has(entity)) {
            return;
        }
        deferredOps.push(createDeferredOp(DeferredOpType.Destroy, entity));
        destroyed.add(entity);
    }
    function destroyImmediate(entity) {
        storage.clearComponents(entity);
    }
    function has(entity, schema) {
        registerSchema(schema);
        return storage.hasComponentOfSchema(entity, schema);
    }
    function get(entity, schema) {
        registerSchema(schema);
        const component = storage.getComponentBySchema(entity, schema);
        if (component === null) {
            throw new Error("Failed to get component: entity does not have component");
        }
        return component;
    }
    function tryGet(entity, schema) {
        registerSchema(schema);
        return storage.getComponentBySchema(entity, schema);
    }
    function reset() {
        destroyed.clear();
        // clear deferred ops
        mutableEmpty(deferredOps);
        // remove all systems
        mutableEmpty(systems);
        // remove all topics
        topics.forEach(topic => topic.clear());
        mutableEmpty(topics);
        // reset entity id counter
        entityIds = 0;
        // reset step data
        world.latestTick = -1;
        world.latestTickData = null;
        world.latestSystemId = -1;
        // release components
        for (let i = 0; i < storage.archetypes.length; i++) {
            const archetype = storage.archetypes[i];
            for (let j = 0; j < archetype.signature.length; j++) {
                const column = archetype.table[j];
                const componentPool = UNSAFE_internals.schemaPools.get(archetype.signature[j]);
                for (let k = 0; k < column.length; k++) {
                    const component = column[k];
                    componentPool?.release(component);
                }
            }
        }
        // reset entity-component storage
        storage.reset();
    }
    function getSnapshot() {
        return {
            storage: storage.getSnapshot(),
        };
    }
    function applyAttachOp(op) {
        const [, entity, components] = op;
        attachImmediate(entity, components);
    }
    function applyDetachOp(op) {
        const [, entity, schemaIds] = op;
        detachImmediate(entity, schemaIds);
    }
    function applyDestroyOp(op) {
        const [, entity] = op;
        destroyImmediate(entity);
    }
    function applyDeferredOp(deferred) {
        switch (deferred[0]) {
            case DeferredOpType.Attach:
                applyAttachOp(deferred);
                break;
            case DeferredOpType.Detach:
                applyDetachOp(deferred);
                break;
            case DeferredOpType.Destroy:
                applyDestroyOp(deferred);
                break;
        }
    }
    function step(data) {
        let prevWorld = UNSAFE_internals.currentWorldId;
        UNSAFE_internals.currentWorldId = id;
        world.latestTickData = data;
        for (let i = 0; i < deferredOps.length; i++) {
            applyDeferredOp(deferredOps[i]);
        }
        mutableEmpty(deferredOps);
        // flush topics
        for (let i = 0; i < topics.length; i++) {
            topics[i].flush();
        }
        // execute systems
        for (let i = 0; i < systems.length; i++) {
            const system = systems[i];
            world.latestSystemId = system[$systemId];
            system(world);
        }
        destroyed.clear();
        world.latestTick++;
        UNSAFE_internals.currentWorldId = prevWorld;
    }
    const id = UNSAFE_internals.worldIds++;
    const world = {
        id,
        storage,
        latestTick: -1,
        latestTickData: null,
        latestSystemId: -1,
        attach,
        attachImmediate,
        addSystem,
        addTopic,
        create,
        destroy,
        destroyImmediate,
        get,
        getSnapshot,
        has,
        detach,
        detachImmediate,
        removeSystem,
        removeTopic,
        reset,
        step,
        tryGet,
    };
    UNSAFE_internals.worlds.push(world);
    return world;
}
//# sourceMappingURL=world.js.map