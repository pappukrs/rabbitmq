// direct-producer.js
const amqp = require('amqplib');

async function sendToDirect() {
  try {
    // 1. Connect to RabbitMQ
    const connection = await amqp.connect('amqp://localhost');
    const channel = await connection.createChannel();

    // 2. Declare a direct exchange
    const exchange = 'direct_logs';
    await channel.assertExchange(exchange, 'direct', {
      durable: false
    });

    // 3. Messages with different severity levels
    const logs = [
      { severity: 'info', message: 'Application started' },
      { severity: 'error', message: 'Database connection failed' },
      { severity: 'warn', message: 'Disk space low' },
      { severity: 'info', message: 'Request processed' },
      { severity: 'error', message: 'Payment gateway timeout' }
    ];

    // 4. Send messages with routing keys
    for (const log of logs) {
      const msg = `[${log.severity.toUpperCase()}] ${log.message}`;
      
      // The routing key determines which queue receives the message
      channel.publish(exchange, log.severity, Buffer.from(msg));
      console.log(`[x] Sent '${log.severity}': ${msg}`);
    }

    // 5. Close connection
    setTimeout(() => {
      connection.close();
      process.exit(0);
    }, 500);

  } catch (error) {
    console.error('Error:', error);
  }
}

sendToDirect();