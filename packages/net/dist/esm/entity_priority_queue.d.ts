import { Entity } from "@javelin/ecs";
import { Comparator } from "./comparator";
import { MinHeap } from "./min_heap";
export default class EntityPriorityQueue extends MinHeap<Entity> {
    private priorities;
    private valueComparator;
    constructor();
    add(entity: Entity, priority?: number): this;
    remove(entity: Entity, customFindingComparator?: Comparator<Entity>): this;
    getPriority(entity: Entity): number;
    changePriority(entity: Entity, priority: number): this;
    findByValue(entity: Entity): number[];
    hasValue(entity: Entity): boolean;
    comparePriority(a: Entity, b: Entity): 0 | 1 | -1;
    compareValue(a: Entity, b: Entity): 0 | 1 | -1;
    poll(): number | null;
}
//# sourceMappingURL=entity_priority_queue.d.ts.map