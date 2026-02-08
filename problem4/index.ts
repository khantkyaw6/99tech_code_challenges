function checkInputHandler(n: number): void {
    if (n < 0) throw new Error("Input must be greater than or equal to zero")
}


// * With Loop
//  * Time Complexity: O(n)
//  * Space Complexity: O(1)

function sum_to_n_a(n: number): number {
    checkInputHandler(n)

    let result = 0;

    for (let i = 0; i <= n; i++) {
        result += i
    }

    return result
}


// * Using Arithmetic equation
//  * Time Complexity: O(1)
//  * Space Complexity: O(1)
function sum_to_n_b(n: number): number {
    checkInputHandler(n)

    return (n * (n + 1)) / 2
}

// * Using reculsive pattern
// * Time Complexity: O(n)
// * Space Complexity: O(n) (call stack)

function sum_to_n_c(n: number): number {
    checkInputHandler(n)
    if (n === 0) return 0
    return n + sum_to_n_c(n - 1)

}

console.log("A:", sum_to_n_a(5));
console.log("B:", sum_to_n_b(5));
console.log("C:", sum_to_n_c(5));
console.log("D:", sum_to_n_a(0));
console.log("E:", sum_to_n_b(-3));
console.log("F:", sum_to_n_c(23)); 