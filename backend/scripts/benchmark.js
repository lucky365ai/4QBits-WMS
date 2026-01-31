const http = require('http');

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/workshops',
  method: 'GET',
};

const NUM_REQUESTS = 1000;
let completed = 0;
let errors = 0;
const start = Date.now();

console.log(`Starting benchmark: ${NUM_REQUESTS} requests to ${options.hostname}:${options.port}${options.path}`);

for (let i = 0; i < NUM_REQUESTS; i++) {
  const req = http.request(options, (res) => {
    res.on('data', () => {}); // Consume stream
    res.on('end', () => {
      completed++;
      if (completed === NUM_REQUESTS) {
        finish();
      }
    });
  });

  req.on('error', (e) => {
    errors++;
    completed++;
    if (completed === NUM_REQUESTS) {
      finish();
    }
  });

  req.end();
}

function finish() {
  const end = Date.now();
  const duration = (end - start) / 1000;
  const rps = NUM_REQUESTS / duration;

  console.log('Benchmark complete:');
  console.log(`Duration: ${duration.toFixed(2)}s`);
  console.log(`Requests: ${NUM_REQUESTS}`);
  console.log(`Errors: ${errors}`);
  console.log(`RPS: ${rps.toFixed(2)} req/s`);
}
