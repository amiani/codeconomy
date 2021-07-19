import { noop } from "./fp";
export function mutableRemoveUnordered(arr, element) {
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
export function mutableRemoveByIndexUnordered(arr, index) {
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
export function mutableRemove(arr, element) {
    const index = arr.indexOf(element);
    if (index === -1) {
        return false;
    }
    arr.splice(index, 1);
    return true;
}
export function mutableEmpty(arr) {
    while (arr.length > 0)
        arr.pop();
    return arr;
}
export function createArray(len = 0, f = noop) {
    return Array(len)
        .fill(undefined)
        .map((_, i) => f(i));
}
export function packSparseArray(array) {
    return array.reduce((a, x, i) => {
        a[i] = x;
        return a;
    }, {});
}
export function unpackSparseArray(packedSparseArray) {
    const sparseArray = [];
    for (const index in packedSparseArray) {
        const i = parseInt(index, 10);
        if (!isNaN(i)) {
            sparseArray[i] = packedSparseArray[index];
        }
    }
    return sparseArray;
}
//# sourceMappingURL=array.js.map