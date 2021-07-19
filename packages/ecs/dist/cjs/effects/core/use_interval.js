"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useInterval = void 0;
const use_performance_1 = require("./use_performance");
const use_ref_1 = require("./use_ref");
function useInterval(interval) {
    const ref = use_ref_1.useRef(interval);
    const performance = use_performance_1.usePerformance();
    const prev = use_ref_1.useRef(0);
    if (!performance) {
        return;
    }
    const time = performance.now();
    if (!prev.value) {
        prev.value = time;
    }
    if (interval !== ref.value) {
        prev.value = time;
        ref.value = interval;
    }
    let hit = false;
    if (time - prev.value >= interval) {
        hit = true;
        prev.value = time;
    }
    return hit;
}
exports.useInterval = useInterval;
//# sourceMappingURL=use_interval.js.map