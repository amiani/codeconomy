import * as Model from "@javelin/core";
import { Cursor } from "./pack";
export declare const $byteView: unique symbol;
export declare enum ByteViewKind {
    Uint8 = 0,
    Uint16 = 1,
    Uint32 = 2,
    Int8 = 3,
    Int16 = 4,
    Int32 = 5,
    Float32 = 6,
    Float64 = 7,
    String8 = 8,
    String16 = 9,
    Boolean = 10
}
export declare type ByteViewField = Model.FieldNumber | Model.FieldString | Model.FieldBoolean;
export declare type ByteView<T extends ByteViewField = ByteViewField> = T & {
    [$byteView]: ByteViewKind;
    byteLength: number;
    read(dataView: DataView, offset: number, length?: number): Model.FieldGet<T>;
    write(dataView: DataView, offset: number, data: Model.FieldGet<T>): void;
};
export declare type StringView = ByteView<Model.FieldString> & {
    [$byteView]: ByteViewKind.String16 | ByteViewKind.String8;
    length?: number;
};
export declare function isByteView(object: object): object is ByteView;
export declare function isStringView(object: object): object is StringView;
export declare function read<T extends ByteView>(dataView: DataView, byteView: T, cursor: Cursor, length?: number): Model.FieldGet<T>;
export declare function write<T extends ByteView>(dataView: DataView, byteView: T, cursor: Cursor, data: Model.FieldGet<T>): void;
export declare const uint8: ByteView<Model.FieldNumber>;
export declare const uint16: ByteView<Model.FieldNumber>;
export declare const uint32: ByteView<Model.FieldNumber>;
export declare const int8: ByteView<Model.FieldNumber>;
export declare const int16: ByteView<Model.FieldNumber>;
export declare const int32: ByteView<Model.FieldNumber>;
export declare const float32: ByteView<Model.FieldNumber>;
export declare const float64: ByteView<Model.FieldNumber>;
export declare const string8: ByteView<Model.FieldString>;
export declare const string16: ByteView<Model.FieldString>;
export declare const boolean: ByteView<Model.FieldBoolean>;
export declare const number: ByteView<Model.FieldNumber>;
export declare const string: ByteView<Model.FieldString>;
export declare function fieldToByteView(field: Model.Field): ByteView<ByteViewField>;
//# sourceMappingURL=views.d.ts.map