"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createEffect = void 0;
const internal_1 = require("./internal");
function isPromise(object) {
    return typeof object === "object" && object !== null && "then" in object;
}
/**
 * Create an effect by specifying an effect factory and optional configuration
 * options.
 *
 * An effect is a stateful function that is used to implement logic in systems
 * without use of singleton components or global state. Each function has
 * access to a closure (the factory) that is used to implement local variables
 * that persist between steps of the world. Effects are called just like normal
 * functions within systems. Javelin automatically resolves the correct closure
 * based on the order the effect is called in within a system.
 *
 * @example
 * const useCounter = createEffect(() => {
 *   // closure
 *   let i = 0
 *   return (base: number) => base + i++
 * })
 * // in a system:
 * // (step 0)
 * const a = useCounter(0)  // 0
 * const b = useCounter(10) // 10
 * // (step 1)
 * const a = useCounter(0)  // 1
 * const b = useCounter(10) // 11
 */
function createEffect(factory, options = { shared: false }) {
    const { shared: global } = options;
    const systemEffectDataByWorldId = [];
    let previousStep;
    let previousWorld;
    let previousSystem;
    let currentWorld;
    let latestSystemId;
    let cellCount = -1;
    return function effect(...args) {
        currentWorld = internal_1.UNSAFE_internals.currentWorldId;
        const world = internal_1.UNSAFE_internals.worlds[currentWorld];
        const step = world.latestTick;
        latestSystemId = global ? 0 : world.latestSystemId;
        let currentWorldSystemEffectData = systemEffectDataByWorldId[currentWorld];
        if (systemEffectDataByWorldId[currentWorld] === undefined) {
            currentWorldSystemEffectData = systemEffectDataByWorldId[currentWorld] =
                [];
        }
        let currentSystemEffect = currentWorldSystemEffectData[latestSystemId];
        if (currentSystemEffect === undefined) {
            currentSystemEffect = currentWorldSystemEffectData[latestSystemId] = {
                cells: [],
                cellCount: -1,
            };
        }
        if (global === true ||
            (previousWorld !== currentWorld && previousWorld !== undefined)) {
            cellCount = 0;
        }
        else if (previousSystem !== undefined &&
            (previousStep !== step || previousSystem !== latestSystemId)) {
            let previousSystemEffectData = currentWorldSystemEffectData[previousSystem];
            if (previousSystemEffectData.cellCount !== -1 &&
                previousSystemEffectData.cellCount !== cellCount) {
                throw new Error(`Failed to execute effect: encountered too ${previousSystemEffectData.cellCount > cellCount ? "few" : "many"} effects this step`);
            }
            previousSystemEffectData.cellCount = cellCount;
            cellCount = 0;
        }
        else {
            cellCount++;
        }
        let cell = currentSystemEffect.cells[cellCount];
        if (!cell) {
            cell = currentSystemEffect.cells[cellCount] = {
                executor: factory(world),
                lockShare: false,
                lockAsync: false,
                lockShareTick: null,
                state: null,
            };
        }
        if (global) {
            if (cell.lockShareTick !== world.latestTick) {
                cell.lockShare = false;
                cell.lockShareTick = world.latestTick;
            }
            else {
                cell.lockShare = true;
            }
        }
        if (cell.lockShare || cell.lockAsync) {
            return cell.state;
        }
        const result = cell.executor(...args);
        if (isPromise(result)) {
            cell.lockAsync = true;
            result
                .then(result => (cell.state = result))
                .catch(error => console.error(`Uncaught error in effect: ${error.message}`, error))
                .then(() => (cell.lockAsync = false));
        }
        else {
            cell.state = result;
        }
        previousStep = step;
        previousWorld = currentWorld;
        previousSystem = latestSystemId;
        return cell.state;
    };
}
exports.createEffect = createEffect;
//# sourceMappingURL=effect.js.map