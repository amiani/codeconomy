export declare type Clock = {
    now: BigInt;
    tick: number;
    dt: number;
};
export declare type HrtimeLoop = {
    /**
     * Start the loop, executing the provided callback at the configured tick
     * rate.
     */
    start(): void;
    /**
     * Stop (pause) the loop.
     */
    stop(): void;
    /**
     * Check if the loop is running.
     */
    isRunning(): boolean;
};
/**
 *
 * @param callback Callback to execute at the specified interval  when `start()` is called
 * @param interval Interval (in ms)
 * @returns
 */
export declare function createHrtimeLoop(callback: (clock: Clock) => void, interval: number): HrtimeLoop;
//# sourceMappingURL=index.d.ts.map