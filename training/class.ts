class Fraction {
    // フィールドの記法は省略記法でいける
    constructor(private _numerator: number, private _denominator: number) {}

    add(other: Fraction): Fraction {
        const resultNumerator =
        this._numerator * other._denominator +
        this._denominator * other._numerator

        const resultDenominator = this._denominator * other._denominator

        return new Fraction(resultNumerator, resultDenominator)
    }

    toString(): string {
        return `${this._numerator}/${this._denominator}`
    }

    get numerator(): number {
        return this._numerator
    }

    get denominator(): number {
        return this._denominator
    }
}

const f1 = new Fraction(1, 2)

const f2 = new Fraction(1, 3)
console.log(f2.toString())

const result = f1.add(f2)
console.log(result.toString())