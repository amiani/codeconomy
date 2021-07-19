import * as Core from "@javelin/core";
import * as Pack from "@javelin/pack";
export declare function encodeModel(model: Pack.ModelEnhanced): ArrayBuffer;
export declare function decodeField(encoded: Uint8Array, cursor: Pack.Cursor): Core.FieldAny | Core.Schema;
export declare function decodeModel(dataView: DataView, cursor: Pack.Cursor, length: number): Core.Model<unknown>;
//# sourceMappingURL=model.d.ts.map