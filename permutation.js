/* eslint-disable no-restricted-syntax */
function subsetPermutations(arr, size) {
  const counts = {};
  for (const el of arr) {
    counts[el] = (counts[el] ?? 0) + 1;
  }
  const unique = Object.keys(counts);
  const result = Array.from({ length: size });
  console.log(`input length of ${arr.length} smooshed to ${unique.length} elements of up to ${size} repeats`);
  function* recurse(depth) {
    if (depth === size) {
      yield result;
    } else {
      for (const el of unique) {
        if (counts[el]) {
          result[depth] = el;
          counts[el] = -1;
          yield* recurse(depth + 1);
          counts[el] = +1;
        }
      }
    }
  }
  return recurse(0);
}

module.exports = { subsetPermutations };
