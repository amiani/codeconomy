"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.unpackSparseArray = exports.packSparseArray = exports.createArray = exports.mutableEmpty = exports.mutableRemove = exports.mutableRemoveByIndexUnordered = exports.mutableRemoveUnordered = void 0;
const fp_1 = require("./fp");
function mutableRemoveUnordered(arr, element) {
    const length = arr.length;
    const index = arr.indexOf(element);
    if (index === -1) {
        return false;
    }
    const last = arr.pop();
    if (index < length - 1) {
        arr[index] = last;
    }
    return true;
}
exports.mutableRemoveUnordered = mutableRemoveUnordered;
function mutableRemoveByIndexUnordered(arr, index) {
    const length = arr.length;
    if (index === -1) {
        return false;
    }
    const last = arr.pop();
    if (index < length - 1) {
        arr[index] = last;
    }
    return true;
}
exports.mutableRemoveByIndexUnordered = mutableRemoveByIndexUnordered;
function mutableRemove(arr, element) {
    const index = arr.indexOf(element);
    if (index === -1) {
        return false;
    }
    arr.splice(index, 1);
    return true;
}
exports.mutableRemove = mutableRemove;
function mutableEmpty(arr) {
    while (arr.length > 0)
        arr.pop();
    return arr;
}
exports.mutableEmpty = mutableEmpty;
function createArray(len = 0, f = fp_1.noop) {
    return Array(len)
        .fill(undefined)
        .map((_, i) => f(i));
}
exports.createArray = createArray;
function packSparseArray(array) {
    return array.reduce((a, x, i) => {
        a[i] = x;
        return a;
    }, {});
}
exports.packSparseArray = packSparseArray;
function unpackSparseArray(packedSparseArray) {
    const sparseArray = [];
    for (const index in packedSparseArray) {
        const i = parseInt(index, 10);
        if (!isNaN(i)) {
            sparseArray[i] = packedSparseArray[index];
        }
    }
    return sparseArray;
}
exports.unpackSparseArray = unpackSparseArray;
//# sourceMappingURL=array.js.map