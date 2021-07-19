"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const comparator_1 = require("./comparator");
const entity_map_1 = require("./entity_map");
const min_heap_1 = require("./min_heap");
class EntityPriorityQueue extends min_heap_1.MinHeap {
    priorities = entity_map_1.createEntityMap();
    valueComparator = new comparator_1.Comparator(this.compareValue);
    constructor() {
        super();
        this.compare = new comparator_1.Comparator(this.comparePriority.bind(this));
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
exports.default = EntityPriorityQueue;
//# sourceMappingURL=entity_priority_queue.js.map