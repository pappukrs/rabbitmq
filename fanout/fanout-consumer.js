// fanout-consumer.js
const amqp = require('amqplib');



async function receiveFromFanout(consumerName) {
  try {

    // 1. Connect to RabbitMQ
    const connection = await amqp.connect('amqp://localhost');
    const channel = await connection.createChannel();

    // 2. Declare the same exchange
    const exchange = 'logs';
    await channel.assertExchange(exchange, 'fanout', {
      durable: false
    });

    // 3. Create an exclusive queue (auto-deleted when consumer disconnects)
    const q = await channel.assertQueue('logs-msg', {
     durable: true
    });

    console.log(`[*] ${consumerName} waiting for messages...`);

    // 4. Bind queue to exchange (no routing key needed for fanout)
    await channel.bindQueue(q.queue, exchange, '');

    // 5. Consume messages
    channel.consume(q.queue, (msg) => {
      if (msg) {
        console.log(`[${consumerName}] Received: ${msg.content.toString()}`);
      }
    }, {
      noAck: true
    });

  } catch (error) {
    console.error('Error:', error);
  }
}

// Get consumer name from command line argument
const consumerName = process.argv[2] || 'Consumer';
receiveFromFanout(consumerName);