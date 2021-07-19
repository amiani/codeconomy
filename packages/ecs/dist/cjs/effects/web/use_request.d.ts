declare type RequestStateInitial = {
    error: null;
    response: null;
    done: false;
};
declare type RequestStateDone<T> = {
    error: null;
    response: T;
    done: true;
};
declare type RequestStateInvalidated<T> = {
    error: null;
    response: T;
    done: false;
};
declare type RequestStateError = {
    error: string;
    response: null;
    done: true;
};
declare type RequestStateErrorAfterInvalidate<T> = {
    error: string;
    response: T;
    done: true;
};
export declare type RequestEffectApi<T = Response> = RequestStateInitial | RequestStateDone<T> | RequestStateInvalidated<T> | RequestStateError | RequestStateErrorAfterInvalidate<T>;
export declare const useRequest: import("../../effect").EffectApi<RequestEffectApi<Response>, [url: string | null, options: RequestInit | undefined, invalidate?: A[2] | undefined]>;
export {};
//# sourceMappingURL=use_request.d.ts.map