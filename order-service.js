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
    const paymentQueue = "payment_queue";
    const paymentResponseQueue = "payment_response_queue";

    ch.assertQueue(orderQueue, { durable: false });
    ch.assertQueue(paymentResponseQueue, { durable: false });

    console.log("Order Service is waiting for messages. To exit press CTRL+C");

    ch.consume(
      orderQueue,
      (msg) => {
        const order = JSON.parse(msg.content.toString());

        // Process order
        // If successful, send message to Payment Service

        const isSuccess = Math.random() < 0.8; // 80% success rate

        if (isSuccess) {
          // Publish payment request message to payment_queue
          ch.sendToQueue(paymentQueue, Buffer.from(JSON.stringify(order)));
          console.log("Payment request sent for order:", order);

          // Listen for payment response
          ch.consume(
            paymentResponseQueue,
            (paymentMsg) => {
              const paymentStatus = JSON.parse(paymentMsg.content.toString());

              if (paymentStatus.status === "success") {
                console.log("Payment successful for order:", order);
                // Handle order success
              } else {
                console.error("Payment failed for order:", order);
                // Handle order failure
              }
            },
            { noAck: true }
          );
        } else {
          console.error("Order processing failed for order:", order);
          // Handle order failure
        }
      },
      { noAck: true }
    );
  });
});
