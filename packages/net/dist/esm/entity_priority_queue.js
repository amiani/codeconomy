import { Comparator } from "./comparator";
import { createEntityMap } from "./entity_map";
import { MinHeap } from "./min_heap";
export default class EntityPriorityQueue extends MinHeap {
    priorities = createEntityMap();
    valueComparator = new Comparator(this.compareValue);
    constructor() {
        super();
        this.compare = new Comparator(this.comparePriority.bind(this));
    }
    add(entity, priority = 0) {
        this.priorities[entity] = priority;
        super.add(entity);
        return this;
    }
    remove(entity, customFindingComparator) {
        super.remove(entity, customFindingComparator);
        delete this.priorities[entity];
        return this;
    }
    getPriority(entity) {
        return this.priorities[entity];
    }
    changePriority(entity, priority) {
        this.remove(entity, this.valueComparator);
        this.add(entity, priority);
        return this;
    }
    findByValue(entity) {
        return this.find(entity, this.valueComparator);
    }
    hasValue(entity) {
        return this.findByValue(entity).length > 0;
    }
    comparePriority(a, b) {
        if (this.priorities[a] === this.priorities[b]) {
            return 0;
        }
        return this.priorities[a] > this.priorities[b] ? -1 : 1;
    }
    compareValue(a, b) {
        if (a === b) {
            return 0;
        }
        return a < b ? -1 : 1;
    }
    poll() {
        const entity = super.poll();
        if (entity !== null) {
            delete this.priorities[entity];
        }
        return entity;
    }
}
//# sourceMappingURL=entity_priority_queue.js.map