const amqp = require("amqplib/callback_api");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(bodyParser.json());

const corsOptions = {
  origin: "https://superjoin-frontend.onrender.com/",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true, // Enable if you want to allow cookies
};

app.use(cors(corsOptions));

// RabbitMQ connection
const RABBITMQ_URL =
  "amqps://swyvhyqm:qZLvJn3NjeT-g-uPeKiNoOLaoOkjjf4m@puffin.rmq2.cloudamqp.com/swyvhyqm";
const QUEUE = "sheet_sync";

app.post("/rabbitmq/publish", (req, res) => {
  const message = JSON.stringify(req.body.message);

  amqp.connect(RABBITMQ_URL, function (error0, connection) {
    if (error0) {
      return res.status(500).send("Error connecting to RabbitMQ");
    }

    connection.createChannel(function (error1, channel) {
      if (error1) {
        return res.status(500).send("Error creating channel");
      }

      channel.assertQueue(QUEUE, { durable: true });
      channel.sendToQueue(QUEUE, Buffer.from(message), { persistent: true });
      console.log(" [x] Sent %s", message);

      res.status(200).send("Message queued successfully");
    });
  });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Publisher service running on port ${port}`);
});
