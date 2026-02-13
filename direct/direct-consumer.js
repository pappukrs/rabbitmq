// direct-consumer.js
const amqp = require('amqplib');

async function receiveFromDirect(severities) {
  try {
    // 1. Connect to RabbitMQ
    const connection = await amqp.connect('amqp://localhost');
    const channel = await connection.createChannel();

    // 2. Declare the same exchange
    const exchange = 'direct_logs';
    await channel.assertExchange(exchange, 'direct', {
      durable: false
    });

    // 3. Create an exclusive queue
    const q = await channel.assertQueue('', {
      exclusive: true
    });

    console.log(`[*] Waiting for logs with severity: ${severities.join(', ')}`);

    // 4. Bind queue to exchange for each severity level
    for (const severity of severities) {
      await channel.bindQueue(q.queue, exchange, severity);
    }

    // 5. Consume messages
    channel.consume(q.queue, (msg) => {
      if (msg) {
        console.log(`[x] ${msg.fields.routingKey}: ${msg.content.toString()}`);
      }
    }, {
      noAck: true
    });

  } catch (error) {
    console.error('Error:', error);
  }
}

// Get severities from command line arguments
const severities = process.argv.slice(2);

if (severities.length === 0) {
  console.log('Usage: node direct-consumer.js [info] [warn] [error]');
  process.exit(1);
}

receiveFromDirect(severities);