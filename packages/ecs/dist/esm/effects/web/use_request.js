import { createEffect } from "../../effect";
export const useRequest = createEffect(() => {
    let state = { response: null, error: null, done: false };
    let fetching = false;
    let previousUrl;
    let abortController = new (typeof window === "object" ? window : global).AbortController();
    return function useRequest(url, options, invalidate = previousUrl !== undefined && url !== previousUrl) {
        if (url === null || invalidate) {
            abortController.abort();
            abortController = new AbortController();
        }
        if (url === null) {
            return state;
        }
        if (invalidate) {
            state = { response: state.response, error: null, done: false };
        }
        if (state.done) {
            return state;
        }
        if (!fetching) {
            fetching = true;
            previousUrl = url;
            fetch(url, { ...options, signal: abortController.signal })
                .then(response => {
                state = { response, error: null, done: true };
            })
                .catch(error => {
                state = { response: state.response, error, done: true };
            })
                .then(() => {
                fetching = false;
            });
        }
        return state;
    };
});
//# sourceMappingURL=use_request.js.map