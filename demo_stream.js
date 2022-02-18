/* eslint-disable no-restricted-syntax */
const { Readable } = require('stream');
const {
  intervalToDuration, formatDuration, format, differenceInMilliseconds,
} = require('date-fns');
const { subsetPermutations } = require('./permutation');

function formatLogs(counter, start) {
  const end = new Date();
  const millDiff = differenceInMilliseconds(end, start);
  const streamTime = millDiff <= 999 ? `${millDiff} ms` : formatDuration(intervalToDuration({
    end: end.getTime(),
    start: start.getTime(),
  }));
  const formattedLogs = `wrote ${counter.toLocaleString()} patterns, after ${streamTime}`;
  return formattedLogs;
}

const TOTAL_RUNTIME_HOURS = 1;
const LOG_INTERVAL_IN_MINUTES = 5;
const LOG_INTERVAL_IN_MS = LOG_INTERVAL_IN_MINUTES * 60 * 1000;
const TOTAL_RUNTIME_MS = TOTAL_RUNTIME_HOURS * 60 * 60 * 1000;
const totalRuns = TOTAL_RUNTIME_MS / LOG_INTERVAL_IN_MS;

let progress = 0;
let timerCallCount = 0;
const startPerm = new Date();
const interval = setInterval(() => {
  console.log(formatLogs(progress, startPerm));
}, LOG_INTERVAL_IN_MS);

const closeImmediate = setTimeout(() => console.log('done!'));
closeImmediate.unref();

const elementsToPermute = Object.keys(
  Array.from({ length: 23 })
).flatMap(
  (key) => Object.keys(Array.from({ length: (41 * key) % 201 }))
);
const baseGenerator = subsetPermutations(elementsToPermute, 5);

function setImmediatePromise() {
  return new Promise((resolve) => { setImmediate(resolve); });
}

const iterStream = Readable.from(async function* () {
  let i = 0;
  for await (const item of baseGenerator) {
    yield item;
    i++;
    if (i % 1e5 === 0) await setImmediatePromise();
  }
}());

console.log(`Stream started on: ${format(startPerm, 'PPPPpppp')}, will run for ${TOTAL_RUNTIME_HOURS} hours, and log ever ${LOG_INTERVAL_IN_MINUTES} minues (${totalRuns} times)`);

// attaching data listener starts the stream

iterStream.on('data', () => {
  progress++;
  if (new Date().getTime() - startPerm.getTime() >= (LOG_INTERVAL_IN_MS * timerCallCount)) {
    console.log(`manual  #${timerCallCount}: ${formatLogs(progress, startPerm)}`);
    timerCallCount++;
    if (timerCallCount >= totalRuns) iterStream.destroy();
  }
});

iterStream.on('error', (err) => {
  console.log(err);
  clearInterval(interval);
});

iterStream.on('close', () => {
  console.log(`closed: ${formatLogs(progress, startPerm)}`);
  clearInterval(interval);
  closeImmediate.ref();
});
