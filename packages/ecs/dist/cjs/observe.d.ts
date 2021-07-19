import { CollatedNode } from "@javelin/core";
import { Component } from "./component";
export declare const $self: unique symbol;
export declare const $touched: unique symbol;
export declare const $changes: unique symbol;
export declare const $delete: unique symbol;
export declare type ChangesBase = {
    node: CollatedNode;
    dirty: boolean;
};
export declare type StructChanges = ChangesBase & {
    changes: {
        [key: string]: unknown;
    };
};
export declare type ArrayChanges = StructChanges;
export declare type ObjectChanges = ChangesBase & {
    changes: {
        [key: string]: typeof $delete | unknown;
    };
};
export declare type SetChanges = ChangesBase & {
    changes: {
        add: unknown[];
        delete: unknown[];
    };
};
export declare type MapChanges = ChangesBase & {
    changes: Map<unknown, typeof $delete | unknown>;
};
export declare type Changes = StructChanges | ArrayChanges | ObjectChanges | SetChanges | MapChanges;
declare type Observed<T = unknown, C = Changes> = {
    [$touched]: boolean;
    [$changes]: C;
    [$self]: Observed<T, C>;
} & T;
export declare type ObservedStruct = Observed<{
    [key: string]: unknown;
}, StructChanges>;
export declare type ObservedArray = Observed<unknown[], ArrayChanges>;
export declare type ObservedObject = Observed<{
    [key: string]: unknown;
}, ObjectChanges>;
export declare type ObservedSet = Observed<Set<unknown>, SetChanges>;
export declare type ObservedMap = Observed<Map<unknown, unknown>, MapChanges>;
export declare function observe<T extends Component>(component: T): T;
export declare function clearObservedChanges(component: Component | Observed<Component, unknown>): void;
export declare function getFieldValue(node: CollatedNode, object: object, fieldId: number, traverse: (number | string)[]): object;
export declare type PatchNode = {
    changes: Map<unknown, unknown>;
    children: Map<unknown, PatchNode>;
};
export declare type Patch = PatchNode & {
    schemaId: number;
};
export declare function createPatch(component: Component, patch?: Patch): Patch;
export declare function resetPatch(patch: Patch): void;
export {};
//# sourceMappingURL=observe.d.ts.map