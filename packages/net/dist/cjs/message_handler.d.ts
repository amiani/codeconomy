import { World } from "@javelin/ecs";
export declare const createMessageHandler: (world: World) => {
    push: (message: ArrayBuffer) => number;
    system: () => void;
    useInfo: import("@javelin/ecs").EffectApi<{
        updated: Set<number>;
    }, []>;
};
//# sourceMappingURL=message_handler.d.ts.map