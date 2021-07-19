import { Schema } from "@javelin/core";
import { Component, ComponentOf } from "./component";
import { Entity } from "./entity";
import { Storage, StorageSnapshot } from "./storage";
import { Topic } from "./topic";
declare const $systemId: unique symbol;
export declare enum DeferredOpType {
    Spawn = 0,
    Attach = 1,
    Detach = 2,
    Mutate = 3,
    Destroy = 4
}
export declare type Spawn = [DeferredOpType.Spawn, number, Component[]];
export declare type Attach = [DeferredOpType.Attach, number, Component[]];
export declare type Detach = [DeferredOpType.Detach, number, number[]];
export declare type Destroy = [DeferredOpType.Destroy, number];
export declare type WorldOp = Spawn | Attach | Detach | Destroy;
export declare type World<T = unknown> = {
    /**
     * Unique world identifier.
     */
    readonly id: number;
    /**
     * Entity-component storage.
     */
    readonly storage: Storage;
    /**
     * Latest step number.
     */
    readonly latestTick: number;
    /**
     * Latest step data passed to world.step().
     */
    readonly latestTickData: T;
    /**
     * Id of the latest invoked system.
     */
    readonly latestSystemId: number;
    /**
     * Process operations from previous step and execute all systems.
     * @param data Step data
     */
    step(data: T): void;
    /**
     * Register a system to be executed each step.
     * @param system
     */
    addSystem(system: System<T>): void;
    /**
     * Remove a system.
     * @param system
     */
    removeSystem(system: System<T>): void;
    /**
     * Register a topic to be flushed each step.
     * @param topic
     */
    addTopic(topic: Topic): void;
    /**
     * Remove a topic.
     * @param topic
     */
    removeTopic(topic: Topic): void;
    /**
     * Create an entity and optionally attach components.
     * @param components The new entity's components
     */
    create(...components: ReadonlyArray<Component>): Entity;
    /**
     * Attach components to an entity. Deferred until next tick.
     * @param entity Entity
     * @param components Components to attach to `entity`
     */
    attach(entity: Entity, ...components: ReadonlyArray<Component>): void;
    /**
     * Attach components to an entity.
     * @param entity Entity
     * @param components Components to attach to `entity`
     */
    attachImmediate(entity: Entity, components: Component[]): void;
    /**
     * Remove attached components from an entity. Deffered until next tick.
     * @param entity Entity
     * @param components Components to detach from `entity`
     */
    detach(entity: Entity, ...components: (Schema | Component | number)[]): void;
    /**
     * Remove attached components from an entity.
     * @param entity Entity
     * @param components Components to detach from `entity`
     */
    detachImmediate(entity: Entity, schemaIds: number[]): void;
    /**
     * Remove all components from an entity. Deferred until next tick.
     * @param entity Entity
     */
    destroy(entity: Entity): void;
    /**
     * Remove all components from an entity.
     * @param entity Entity
     */
    destroyImmediate(entity: Entity): void;
    /**
     * Find the component of an entity by type. Throws an error if component is not found.
     * @param entity
     * @param schema
     */
    get<T extends Schema>(entity: Entity, schema: T): ComponentOf<T>;
    /**
     * Find the component of an entity by type, or null if a component is not found.
     * @param entity
     * @param schema
     */
    tryGet<T extends Schema>(entity: Entity, schema: T): ComponentOf<T> | null;
    /**
     * Check if an entity has a component of a specified schema.
     * @param entity
     * @param schema
     */
    has(entity: Entity, schema: Schema): boolean;
    /**
     * Reset the world to its initial state, removing all entities, components,
     * systems, topics, and deferred operations.
     */
    reset(): void;
    /**
     * Create a serializable snapshot of the world that can be restored later.
     */
    getSnapshot(): WorldSnapshot;
};
export declare type WorldSnapshot = {
    storage: StorageSnapshot;
};
export declare type System<T> = ((world: World<T>) => void) & {
    [$systemId]?: number;
};
export declare type WorldOptions<T> = {
    /**
     * Number of components to initialize component pools with. Can be overriden
     * for a specific component type via `registerSchema`.
     */
    componentPoolSize?: number;
    /**
     * Snapshot to hydrate world from.
     */
    snapshot?: WorldSnapshot;
    /**
     * Systems to execute each step.
     */
    systems?: System<T>[];
    /**
     * Topics to flush at the end of each step.
     */
    topics?: Topic[];
};
/**
 * Create a world.
 * @param options WorldOptions
 * @returns World
 */
export declare function createWorld<T = void>(options?: WorldOptions<T>): World<T>;
export {};
//# sourceMappingURL=world.d.ts.map