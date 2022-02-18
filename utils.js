const {
  differenceInMilliseconds, formatDuration, intervalToDuration, format,
} = require('date-fns');

function makeArray(length) {
  return Array.from({
    length,
  }).fill(0);
}

function smooshToLimit(patterns, limit) {
  const baseMap = new Map();
  patterns.forEach((pattern) => {
    let { count = 0 } = baseMap.get(pattern) ?? {};
    baseMap.set(pattern, { count: Math.min(++count, limit) });
  });
  return baseMap;
}

/**
 * Calculates the result of multiplying many polynomials together
 * @example
 *   polynomials = [{0: 1, 1: 10, 2:1}, {0: 0, 1: 5, 2: 0, 3: 0.5}]
 *   limit = 4;
 *   polynomialMultiplication(polynomials, limit);
 * @param {Array.<Object.<number,number>>} polynomials an array of polynomials,
 * each expressed as an array of term coefficients
 * @param {number} limit the maximum term to calculate
 * @returns the resultant polynomial from multiplying all polynomials together
 */
function polynomialMultiplication(polynomials, { limit, multiplyCb = (a, b) => a * b }) {
  const length = limit ?? polynomials.reduce(
    (sum, poly) => {
      const newSum = sum + Math.max(...Object.keys(poly));
      return newSum;
    },
    0,
  );
  // make an object to hold the result in
  // which is prepopulated by zeros
  const template = {
    ...makeArray(length),
  };
  return polynomials.reduce((memo, poly, polyIndex) => {
    const tempCopy = { ...template };
    if (polyIndex === 0) return { ...poly };
    const polyMax = Math.max(...Object.keys(poly));
    const memoMax = Math.max(...Object.keys(memo));
    for (let termIndex = 0; termIndex < length && termIndex <= polyMax; termIndex++) {
      for (let memoIndex = 0; (memoIndex + termIndex) <= length
        && memoIndex <= memoMax; memoIndex++) {
        const addition = multiplyCb((memo[memoIndex] ?? 0), (poly[termIndex] ?? 0));
        const copyIndex = memoIndex + termIndex;
        tempCopy[copyIndex] = (tempCopy[copyIndex] ?? 0) + addition;
      }
    }
    return tempCopy;
  }, template);
}

const factorialCached = () => {
  const cache = [1];
  return function _factorial(n) {
    cache[n] = !(n in cache) ? n * _factorial(n - 1) : cache[n];
    return cache[n];
  };
};

const createPoly = (num, factorial) => {
  if (!Number.isInteger(num)) throw new Error('input must be a number');
  return {
    ...makeArray(num + 1).map((_, term) => {
      const reciprocalFacto = (1.0 / factorial(term));
      return reciprocalFacto;
    }),
  };
};

function reduceGen(patternPermGen, reduceCallback, init) {
  let memo = init;
  let value;
  let done = false;
  do {
    ({ value, done } = patternPermGen.next());
    memo = !done ? reduceCallback(memo, value) : memo;
  } while (!done);
  return memo;
}

function findPattern(word, candidate) {
  const indexes = [0, 1, 2, 3, 4, 5];
  const toColour = (idx) => {
    if (word[idx] === candidate[idx]) return 'g';
    if (candidate.includes(word[idx])) return 'o';
    return 'b';
  };
  return indexes.map((idx) => toColour(idx)).join('');
}

function formatLogs(counter, start) {
  const end = new Date();
  const millDiff = differenceInMilliseconds(end, start);
  const streamTime = millDiff <= 999 ? `${millDiff} ms` : formatDuration(intervalToDuration({
    end: end.getTime(),
    start: start.getTime(),
  }));
  const formattedLogs = `wrote ${counter.toLocaleString()} patterns, after ${streamTime} (${format(end, 'pp')})`;
  return formattedLogs;
}

module.exports = {
  findPattern,
  smooshToLimit,
  reduceGen,
  formatLogs,
  polynomialMultiplication,
  createPoly,
  factorialCached,
};
