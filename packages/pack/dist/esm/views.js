import * as Model from "@javelin/core";
import { $kind } from "@javelin/core";
export const $byteView = Symbol("javelin_byte_view");
export var ByteViewKind;
(function (ByteViewKind) {
    ByteViewKind[ByteViewKind["Uint8"] = 0] = "Uint8";
    ByteViewKind[ByteViewKind["Uint16"] = 1] = "Uint16";
    ByteViewKind[ByteViewKind["Uint32"] = 2] = "Uint32";
    ByteViewKind[ByteViewKind["Int8"] = 3] = "Int8";
    ByteViewKind[ByteViewKind["Int16"] = 4] = "Int16";
    ByteViewKind[ByteViewKind["Int32"] = 5] = "Int32";
    ByteViewKind[ByteViewKind["Float32"] = 6] = "Float32";
    ByteViewKind[ByteViewKind["Float64"] = 7] = "Float64";
    ByteViewKind[ByteViewKind["String8"] = 8] = "String8";
    ByteViewKind[ByteViewKind["String16"] = 9] = "String16";
    ByteViewKind[ByteViewKind["Boolean"] = 10] = "Boolean";
})(ByteViewKind || (ByteViewKind = {}));
export function isByteView(object) {
    return Model.isField(object) && "byteLength" in object;
}
export function isStringView(object) {
    return isByteView(object) && object[$kind] === Model.FieldKind.String;
}
export function read(dataView, byteView, cursor, length = byteView.length ?? 1) {
    const data = byteView.read(dataView, cursor.offset, length);
    cursor.offset += byteView.byteLength * length;
    return data;
}
export function write(dataView, byteView, cursor, data) {
    const length = byteView.length ?? 1;
    byteView.write(dataView, cursor.offset, data);
    cursor.offset += byteView.byteLength * length;
}
function createByteView(kind, field, byteLength, read, write) {
    return {
        ...field,
        [$byteView]: kind,
        byteLength,
        read,
        write,
    };
}
export const uint8 = createByteView(ByteViewKind.Uint8, Model.number, 1, (dataView, offset) => dataView.getUint8(offset), (dataView, offset, data) => dataView.setUint8(offset, data));
export const uint16 = createByteView(ByteViewKind.Uint16, Model.number, 2, (dataView, offset) => dataView.getUint16(offset), (dataView, offset, data) => dataView.setUint16(offset, data));
export const uint32 = createByteView(ByteViewKind.Uint32, Model.number, 4, (dataView, offset) => dataView.getUint32(offset), (dataView, offset, data) => dataView.setUint32(offset, data));
export const int8 = createByteView(ByteViewKind.Int8, Model.number, 1, (dataView, offset) => dataView.getInt8(offset), (dataView, offset, data) => dataView.setInt8(offset, data));
export const int16 = createByteView(ByteViewKind.Int16, Model.number, 2, (dataView, offset) => dataView.getInt16(offset), (dataView, offset, data) => dataView.setInt16(offset, data));
export const int32 = createByteView(ByteViewKind.Int32, Model.number, 4, (dataView, offset) => dataView.getInt32(offset), (dataView, offset, data) => dataView.setInt32(offset, data));
export const float32 = createByteView(ByteViewKind.Float32, Model.number, 4, (dataView, offset) => dataView.getFloat32(offset), (dataView, offset, data) => dataView.setFloat32(offset, data));
export const float64 = createByteView(ByteViewKind.Float64, Model.number, 8, (dataView, offset) => dataView.getFloat64(offset), (dataView, offset, data) => dataView.setFloat64(offset, data));
export const string8 = createByteView(ByteViewKind.String8, Model.string, 1, (dataView, offset, length = 0) => {
    let value = "";
    for (let i = 0; i < length; i++) {
        const charCode = dataView.getUint8(offset);
        if (charCode === 0) {
            break;
        }
        value += String.fromCharCode(charCode);
        offset++;
    }
    return value;
}, (dataView, offset, data) => {
    for (let j = 0; j < data.length; j++) {
        dataView.setUint8(offset, data[j].charCodeAt(0));
        offset++;
    }
});
export const string16 = createByteView(ByteViewKind.String16, Model.string, 2, (dataView, offset, length = 0) => {
    let value = "";
    for (let i = 0; i < length; i++) {
        const charCode = dataView.getUint16(offset);
        if (charCode === 0) {
            break;
        }
        value += String.fromCharCode(charCode);
        offset += string16.byteLength;
    }
    return value;
}, (dataView, offset, data) => {
    for (let j = 0; j < data.length; j++) {
        dataView.setUint16(offset, data[j].charCodeAt(0));
        offset += string16.byteLength;
    }
});
export const boolean = createByteView(ByteViewKind.Boolean, Model.boolean, uint8.byteLength, (dataView, offset) => !!uint8.read(dataView, offset), (dataView, offset, value) => uint8.write(dataView, offset, +value));
export const number = float64;
export const string = string16;
export function fieldToByteView(field) {
    if (isByteView(field)) {
        return field;
    }
    switch (field[$kind]) {
        case Model.FieldKind.Number:
        case Model.FieldKind.Dynamic:
            return number;
        case Model.FieldKind.String:
            return string;
        case Model.FieldKind.Boolean:
            return boolean;
    }
    throw new Error(`Failed to find dataView: unsupported field "${field[$kind]}"`);
}
//# sourceMappingURL=views.js.map