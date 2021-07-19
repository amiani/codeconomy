import { Schema } from "@javelin/core";
import { Archetype, ArchetypeSnapshot } from "./archetype";
import { Component, ComponentOf } from "./component";
import { Entity } from "./entity";
import { Signal } from "./signal";
export declare type StorageSnapshot = {
    archetypes: ArchetypeSnapshot[];
};
export declare type Storage = {
    /**
     * Archetype table.
     */
    readonly archetypes: ReadonlyArray<Archetype>;
    /**
     * Signal dispatched with newly created archetypes immediately after they are created.
     */
    readonly archetypeCreated: Signal<Archetype>;
    /**
     * Signal dispatched when an entity begins transitioning between archetypes.
     */
    readonly entityRelocating: Signal<Entity, Archetype, Archetype, Component[]>;
    /**
     * Signal dispatched when an entity transitions between archetypes.
     */
    readonly entityRelocated: Signal<Entity, Archetype, Archetype, Component[]>;
    /**
     * Attach components to an entity.
     * @param entity Entity
     * @param components Components to attach
     */
    attachComponents(entity: Entity, components: Component[]): void;
    /**
     * Attach or update an entity's components.
     * @param entity Entity
     * @param components Components to either attach or update
     */
    attachOrUpdateComponents(entity: Entity, components: Component[]): void;
    /**
     * Detach components from an entity via schema ids.
     * @param entity Entity
     * @param schemaIds Components to detach
     */
    detachBySchemaId(entity: Entity, schemaIds: number[]): void;
    /**
     * Remove all components from an entity.
     * @param entity Entity
     */
    clearComponents(entity: Entity): void;
    /**
     * Check if an entity has a component of a particular schema.
     * @param entity
     * @param schema
     */
    hasComponentOfSchema(entity: Entity, schema: Schema): boolean;
    /**
     * Locate an entity's component by schema.
     * @param entity Entity
     * @param schema Component schema
     */
    getComponentBySchema<S extends Schema>(entity: Entity, schema: S): ComponentOf<S> | null;
    /**
     * Locate an entity's component by schema id.
     * @param entity Entity
     * @param schema Component schema id
     */
    getComponentBySchemaId(entity: Entity, schemaId: number): Component | null;
    /**
     * Get all components of an entity.
     * @param entity Entity
     */
    getAllComponents(entity: Entity): Component[];
    /**
     * Reset all entity-component data.
     */
    reset(): void;
    /**
     * Take a serializable snapshot of the storage's entity-component data.
     */
    getSnapshot(): StorageSnapshot;
};
export declare type StorageOptions = {
    snapshot?: StorageSnapshot;
};
export declare function createStorage(options?: StorageOptions): Storage;
//# sourceMappingURL=storage.d.ts.map