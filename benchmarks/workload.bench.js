/**
 * ToastNova Workload & Runtime Performance Benchmarks
 * Tests notification dispatch throughput, deduplication latency,
 * update speed, and memory stability under high stress workloads.
 */

import { performance } from 'perf_hooks';
import { toast, toastStore } from '../dist/index.js';

// Setup minimal simulated window environment for full client store execution
if (typeof global.window === 'undefined') {
  global.window = {
    setTimeout,
    clearTimeout,
    matchMedia: () => ({ matches: false })
  };
}

console.log('='.repeat(70));
console.log('ToastNova Runtime Performance Benchmarks');
console.log(`Node.js: ${process.version} | Platform: ${process.platform} (${process.arch})`);
console.log('='.repeat(70));

function runBenchmark(name, fn, iterations) {
  toastStore.clear();
  // Warm-up
  for (let i = 0; i < 50; i++) {
    fn(i);
  }
  toastStore.clear();

  const startMemory = process.memoryUsage().heapUsed;
  const startTime = performance.now();

  for (let i = 0; i < iterations; i++) {
    fn(i);
  }

  const duration = performance.now() - startTime;
  const endMemory = process.memoryUsage().heapUsed;
  const opsPerSec = Math.round((iterations / duration) * 1000);
  const avgLatencyUs = ((duration / iterations) * 1000).toFixed(2);
  const memoryDeltaKb = ((endMemory - startMemory) / 1024).toFixed(1);

  console.log(`\n▶ Benchmark: ${name}`);
  console.log(`  Operations:     ${iterations.toLocaleString()}`);
  console.log(`  Total Time:     ${duration.toFixed(2)} ms`);
  console.log(`  Throughput:     ${opsPerSec.toLocaleString()} ops/sec`);
  console.log(`  Avg Latency:    ${avgLatencyUs} µs/op`);
  console.log(`  Heap Delta:     ${memoryDeltaKb} kB`);

  return { name, iterations, duration, opsPerSec, avgLatencyUs, memoryDeltaKb };
}

// 1. Throughput under 'allow' strategy (Max Visible = 10, remaining queued)
toastStore.setMaxVisible(10);
toastStore.setDuplicateConfig('allow', 0);
const res1 = runBenchmark(
  'Direct Notification Dispatch (Allow Strategy, Queue Flood)',
  (i) => toast.info(`Message index #${i}`),
  5000
);

// 2. Throughput under 'dedupe' strategy (Deduplicating identical messages)
toastStore.setMaxVisible(10);
toastStore.setDuplicateConfig('dedupe', 5000);
const res2 = runBenchmark(
  'Duplicate Deduplication (Dedupe Strategy, 5s Window)',
  (i) => toast.success(`Repeated payload #${i % 10}`, { dedupeKey: `key_${i % 10}` }),
  5000
);

// 3. Throughput under 'group' strategy (Incrementing count badge)
toastStore.setMaxVisible(10);
toastStore.setDuplicateConfig('group', 5000);
const res3 = runBenchmark(
  'Duplicate Grouping & Counter Aggregation (Group Strategy)',
  (i) => toast.warning(`Frequent warning event #${i % 5}`),
  5000
);

// 4. In-place Updates by ID
toastStore.clear();
toastStore.setMaxVisible(20);
const activeIds = [];
for (let i = 0; i < 20; i++) {
  activeIds.push(toast(`Baseline toast #${i}`, { duration: 0 }));
}
const res4 = runBenchmark(
  'In-Place Dynamic Updates (toast.update by ID)',
  (i) => {
    const targetId = activeIds[i % activeIds.length];
    toast.update(targetId, {
      progress: (i % 100),
      message: `Updated progress value: ${i % 100}%`
    });
  },
  5000
);

// 5. Store Subscription Dispatch Latency with 10 Active Listeners
toastStore.clear();
const listeners = [];
let callbackCount = 0;
for (let l = 0; l < 10; l++) {
  listeners.push(toastStore.subscribe(() => { callbackCount++; }));
}
const res5 = runBenchmark(
  'Store Subscription Broadcast (10 Active Subscribers)',
  (i) => toast.info(`Subscriber event #${i}`),
  2500
);
// Cleanup listeners
for (const unsub of listeners) {
  unsub();
}

console.log('\n' + '='.repeat(70));
console.log('SUMMARY TABLE');
console.log('='.repeat(70));
console.table([
  {
    Benchmark: 'Queue Flood (Allow)',
    'Ops / Sec': res1.opsPerSec.toLocaleString(),
    'Avg Latency': `${res1.avgLatencyUs} µs`,
    'Total (ms)': res1.duration.toFixed(1)
  },
  {
    Benchmark: 'Dedupe Strategy',
    'Ops / Sec': res2.opsPerSec.toLocaleString(),
    'Avg Latency': `${res2.avgLatencyUs} µs`,
    'Total (ms)': res2.duration.toFixed(1)
  },
  {
    Benchmark: 'Group Strategy',
    'Ops / Sec': res3.opsPerSec.toLocaleString(),
    'Avg Latency': `${res3.avgLatencyUs} µs`,
    'Total (ms)': res3.duration.toFixed(1)
  },
  {
    Benchmark: 'In-Place Updates',
    'Ops / Sec': res4.opsPerSec.toLocaleString(),
    'Avg Latency': `${res4.avgLatencyUs} µs`,
    'Total (ms)': res4.duration.toFixed(1)
  },
  {
    Benchmark: '10 Subscribers Broadcast',
    'Ops / Sec': res5.opsPerSec.toLocaleString(),
    'Avg Latency': `${res5.avgLatencyUs} µs`,
    'Total (ms)': res5.duration.toFixed(1)
  }
]);
console.log('='.repeat(70));
