const { wordles, candidates } = require('./wordle.const');
const start = new Date();
const rowPatterns = []

const patternBank = new Set();
let previousBankSize = patternBank.size;
wordles.forEach((word, index) => {
    const pattern = candidates.flatMap(candidate => findPattern(word, candidate));
    patternBank.add(...pattern)
    console.log(`prev: ${previousBankSize}, now ${patternBank.size}, ${index}`);
    previousBankSize = patternBank.size;
})
const end = new Date();
console.log(`${patternBank.size} total patterns in ${(end.getTime() - start.getTime()) / 1000}`);
console.log(patternBank);

function findPattern(word, candidate) {
    const indexes = [0, 1, 2, 3, 4, 5];
    const toColour = (idx) => {
        if (word[idx] === candidate[idx]) return 'green';
        else if (candidate.includes(word[idx])) return 'orange';
        return 'black';
    }
    return indexes.map(idx => toColour(idx)).join(',');

}
