function add1(v1: number, v2: number): number {
    return v1 + v2
}

const result1 = add1(1, 2)
console.log(`result1 = ${result1}`)

// アロー関数
const add3 = (v1: number, v2: number) => {
    return v1 + v2
}

const result3 = add3(1, 2)
console.log(`result3 = ${result3}`)