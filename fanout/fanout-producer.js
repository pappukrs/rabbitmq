const amqblib = require('amqplib');

// console.log(amqblib)



async function sendFanout() {

    try {

        //connect to rabbitmq

        const connection = await amqblib.connect('amqp://localhost:5672');
        const channel = await connection.createChannel()


        //declare a fanout

        const exchange = 'logs'
        await channel.assertExchange(exchange,'fanout',{
            durable:false
        })


        const messages = [
            'User Logged IN',
            "File Uploaded",
            "Payment processed"
    ]

    for (const msg of messages){
        channel.publish(exchange,'',Buffer.from(msg));
        console.log(`[x] sent ;${msg}`)
    }


    //close the connection after deelay

    setTimeout(()=>{
        connection.close();
        process.exit(0)
    },500)
        
    } catch (error) {

        console.log(`Error: ${error}`)
        
    }
    
}


sendFanout();