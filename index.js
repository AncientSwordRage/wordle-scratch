/* eslint-disable no-restricted-syntax */
const { wordles, candidates } = require('./wordle.const');
const {
  findPattern,
  formatLogs, smooshToLimit, reduceGen, factorialCached, createPoly, polynomialMultiplication,
} = require('./utils');

const start = new Date();
const totalRows = 6;

const uniquePatterns = new Set();
let previousBankSize = uniquePatterns.size;

const factorial = factorialCached();

wordles.map((word, index) => {
  previousBankSize = uniquePatterns.size;
  const patterns = candidates.flatMap((candidate) => findPattern(word, candidate));
  // filter to max number of combos - 6
  const patternSmoosh = smooshToLimit(patterns, totalRows);
  const polynomials = [];
  for (const pattern of patternSmoosh.values()) {
    polynomials.push(createPoly(pattern.count, factorial));
  }
  const sixthOrderLimitedPoly = Object.assign([], polynomialMultiplication(polynomials, totalRows));
  console.log(word, sixthOrderLimitedPoly[totalRows] * factorial(6));
  const smooshCount = (/** @type {number} */ +reduceGen(
    patternSmoosh.values(),
    (sum, { count }) => sum + count,
    0,
  ));
  // console.log(`Smooshed ${patterns.length} array elements to size ${smooshCount} of up to 6 unique`);
  patterns.forEach(uniquePatterns.add, uniquePatterns);
  const patternsAdded = uniquePatterns.size - previousBankSize;
  if (patternsAdded) console.log(`# of patterns added: ${patternsAdded}`);
  const message = `words #${index.toString(10).padStart(4, '0')}: ${word} has ${patternSmoosh.size} unique patterns, ${smooshCount} total`;
  return {
    word, patterns, patternSmoosh, smooshCount, message,
  };
}).sort((a, b) => {
  const uniqueCount = a.patternSmoosh.size - b.patternSmoosh.size;
  return uniqueCount === 0 ? a.smooshCount - a.smooshCount : uniqueCount;
}).forEach((word) => console.log(word.message));
console.log(formatLogs(uniquePatterns.size, start));
