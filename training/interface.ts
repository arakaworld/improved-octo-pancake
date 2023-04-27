const STONE = 0
const PAPER = 1
const SCISSORS = 2

interface HandGenerator {
    generate(): number
}

class RandomHandGenerator {
    generate(): number {
        return Math.floor(Math.random() * 3)
    }

    genrerateArray(): number[] {
        return []
    }
}

class Janken {
    play(handGenerator: HandGenerator): void {
        const computerHand = handGenerator.generate()

        console.log(`computerHand = ${computerHand}`)

        // 勝利判定などが続く…
    }
}

const janken = new Janken()
const handGenerator = new RandomHandGenerator()
janken.play(handGenerator)

class StoneHandGenerator {
    generate(): number {
        return STONE
    }
}

const handGenerator2 = new StoneHandGenerator()
janken.play(handGenerator2)
