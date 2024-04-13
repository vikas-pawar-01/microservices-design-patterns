const amqp = require("amqplib/callback_api");

// Connect to RabbitMQ
amqp.connect("amqp://localhost", (err, conn) => {
  if (err) {
    console.error("Error connecting to RabbitMQ:", err);
    return;
  }

  conn.createChannel((err, ch) => {
    if (err) {
      console.error("Error creating channel:", err);
      return;
    }

    const orderQueue = "order_queue";
    const order = {
      orderId: 1,
      amount: 100,
    };

    ch.assertQueue(orderQueue, { durable: false });

    // Send order message
    ch.sendToQueue(orderQueue, Buffer.from(JSON.stringify(order)));

    console.log("Order sent:", order);
  });
});
