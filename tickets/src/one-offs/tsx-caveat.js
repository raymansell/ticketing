import { connect } from '@nats-io/transport-node';

const connection = await connect({
  servers: 'http://nats-srv:4222',
  reconnect: false,
});

console.log(`[one-off] Connected to NATS (${connection.getServer()})`);

connection.closed().then((err) => {
  console.log(
    `NATS connection closed ${err ? ' with error: ' + err.message : ''}`
  );
  process.exit(); // `tsx watch one_off.js` vs `tsx one_off.js` caveat
  // try deleting the NATS pod on each scenario to see the difference
  // the node process for the tsx watcher remains alive (if executed w/o the watch flag, then it successfully shuts down the proccess and k8s can restart the tickets pod)
});

process.on('SIGINT', async () => {
  // console.log('received sigint');
  console.log('closing nats consumer connection');
  await connection.close();
});
process.on('SIGTERM', async () => {
  // console.log('received sigterm');
  console.log('closing nats consumer connection');
  await connection.close();
});
