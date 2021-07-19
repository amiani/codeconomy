export declare type SignalSubscriber<T, T2, T3, T4> = T extends void ? () => void : (t: T, t2: T2, t3: T3, t4: T4) => void;
export declare type SignalUnsubscribeCallback = () => void;
export declare type Signal<T = unknown, T2 = unknown, T3 = unknown, T4 = unknown> = {
    subscribe(subscriber: SignalSubscriber<T, T2, T3, T4>): SignalUnsubscribeCallback;
    dispatch(t?: T, t2?: T2, t3?: T3, t4?: T4): void;
};
export declare const createSignal: <T = void, T2 = void, T3 = void, T4 = void>() => Signal<T, T2, T3, T4>;
//# sourceMappingURL=signal.d.ts.map