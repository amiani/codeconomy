import { createEffect } from "../../effect";
export const useTimer = createEffect(() => {
    let state = 0;
    let timer;
    return function useTimer(duration, invalidate = false) {
        if (invalidate) {
            state = 0;
            clearTimeout(timer);
        }
        if (state === 0) {
            state = 1;
            timer = setTimeout(() => {
                state = 2;
            }, duration);
        }
        return state === 2;
    };
});
//# sourceMappingURL=use_timer.js.map