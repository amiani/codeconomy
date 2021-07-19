import { CollatedNode, Model } from "@javelin/core";
import { ByteView } from "./views";
export declare type Cursor = {
    offset: number;
};
declare type BufferField = {
    view: ByteView;
    value: unknown;
    byteLength: number;
};
export declare function serialize(out: BufferField[], node: CollatedNode<ByteView>, object: any, offset?: number): number;
export declare function encode(object: any, node: CollatedNode<ByteView>, cursor?: {
    offset: number;
}): ArrayBuffer;
declare const decodeInner: (dataView: DataView, node: CollatedNode<ByteView>, cursor: Cursor, target?: unknown) => unknown;
export declare function decode<T extends ReturnType<typeof decodeInner>>(buffer: ArrayBuffer, node: CollatedNode<ByteView>, cursor?: Cursor, target?: unknown): T;
export declare type ModelEnhanced = Model<ByteView>;
export declare function enhanceModelInner(node: CollatedNode): void;
export declare function enhanceModel(model: Model): ModelEnhanced;
export * from "./views";
//# sourceMappingURL=pack.d.ts.map