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

    const paymentQueue = "payment_queue";
    const paymentResponseQueue = "payment_response_queue";

    ch.assertQueue(paymentQueue, { durable: false });
    ch.assertQueue(paymentResponseQueue, { durable: false });

    console.log(
      "Payment Service is waiting for messages. To exit press CTRL+C"
    );

    ch.consume(
      paymentQueue,
      (msg) => {
        const order = JSON.parse(msg.content.toString());

        sendPayment(order)
          .then((result) => {
            console.log("Payment Result:", result);

            // Publish payment response message to payment_response_queue
            const paymentStatus = {
              status: "success",
              message: "Payment processed successfully",
            };
            ch.sendToQueue(
              paymentResponseQueue,
              Buffer.from(JSON.stringify(paymentStatus))
            );
          })
          .catch((err) => {
            console.error("Payment Error:", err);

            // Publish payment response message to payment_response_queue
            const paymentStatus = {
              status: "failure",
              message: "Payment failed",
            };
            ch.sendToQueue(
              paymentResponseQueue,
              Buffer.from(JSON.stringify(paymentStatus))
            );
          });
      },
      { noAck: true }
    );

    function sendPayment(order) {
      return new Promise((resolve, reject) => {
        // Payment processing logic here
        const isSuccess = Math.random() < 0.8; // 80% success rate

        if (isSuccess) {
          resolve({
            status: "success",
            message: "Payment processed successfully",
          });
        } else {
          reject(new Error("Payment failed"));
        }
      });
    }
  });
});
