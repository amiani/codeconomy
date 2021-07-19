"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createStackPool = void 0;
function createStackPool(type, reset, size) {
    const heap = [];
    const allocate = () => {
        for (let i = 0; i < size; i++) {
            heap.push(type(pool));
        }
    };
    const retain = () => {
        if (!heap.length) {
            allocate();
        }
        return heap.pop();
    };
    const release = (obj) => {
        heap.push(reset(obj));
    };
    const pool = {
        allocate,
        retain,
        release,
    };
    return pool;
}
exports.createStackPool = createStackPool;
//# sourceMappingURL=stack_pool.js.map