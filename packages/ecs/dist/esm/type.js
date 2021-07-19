export function typeIsSuperset(right, left) {
    let i = 0;
    let j = 0;
    if (right.length < left.length) {
        return false;
    }
    while (i < right.length && j < left.length) {
        if (right[i] < left[j]) {
            i++;
        }
        else if (right[i] === left[j]) {
            i++;
            j++;
        }
        else {
            return false;
        }
    }
    return j === left.length;
}
//# sourceMappingURL=type.js.map