"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createHrtimeLoop = void 0;
const NS_PER_MS = 1_000_000;
/**
 *
 * @param callback Callback to execute at the specified interval  when `start()` is called
 * @param interval Interval (in ms)
 * @returns
 */
function createHrtimeLoop(callback, interval) {
    const clock = { now: BigInt(0), tick: 0, dt: 0 };
    const intervalNs = BigInt(Math.trunc(interval * NS_PER_MS));
    // timeoutThreshold determines whether setTimeout or setImmediate is used to
    // schedule the next check. setTimeout is used if the time between checks is
    // less than the value of timeoutThreshold, otherwise setImmediate is used
    const timeoutThreshold = intervalNs / BigInt(8);
    const timeoutThresholdMs = Number(timeoutThreshold) / NS_PER_MS;
    // timeoutScheduleMs is the amount of time we schedule the next check after
    // a successful check
    const timeoutScheduleMs = timeoutThresholdMs * 2;
    let acc = BigInt(0);
    let running = false;
    let previous = process.hrtime.bigint();
    function check() {
        if (!running) {
            return;
        }
        const now = process.hrtime.bigint();
        acc += now - previous;
        if (acc >= intervalNs) {
            clock.dt = Number(acc) / NS_PER_MS;
            clock.now = now;
            clock.tick++;
            acc = BigInt(0);
            callback(clock);
            setTimeout(check, timeoutScheduleMs);
        }
        else if (acc < timeoutThreshold) {
            setTimeout(check);
        }
        else {
            setImmediate(check);
        }
        previous = now;
    }
    return {
        start() {
            running = true;
            check();
        },
        stop() {
            running = false;
        },
        isRunning() {
            return running;
        },
    };
}
exports.createHrtimeLoop = createHrtimeLoop;
//# sourceMappingURL=index.js.map