# "taulukko-messages" README.md  

## Taulukko Messages

Taulukko Messages is a lightweight, efficient, and embedded JavaScript messaging library designed to facilitate communication between servers and components through a publish/subscribe model. This library is ideal for applications that require a reliable messaging system.

### Features

- **Ease of Configuration**: Quickly set up message servers with a simple set of options.
- **Flexible Publishing and Subscription**: Send messages to multiple topics and easily subscribe to receive updates.
- **Efficient Message Handling**: Deal with received messages using an intuitive message handler system.
- **High Performance**: Designed to handle high volumes of messages with low latency.

### Project Goals

- Provide a simple way to learn and implement messaging systems.
- Offer an easy-to-integrate, embedded messaging system solution.
- Ideal for small-scale projects seeking to avoid unnecessary complexities.
- Supports handling thousands of messages per second efficiently.

### Project Limitations

- Does not support multi-server architectures.
- Lacks persistence; all data is lost if the server shuts down.
- Designed for vertical scaling, best suited for projects with a single server and a steady, controlled number of clients.

### Installation

You can install Taulukko Messages via NPM:

```bash
npm install taulukko-messages
```

### Usage Examples

#### Initializing the Server

```javascript
import { Server } from 'taulukko-messages';

async function initServer() {

  const server = Server.create();
  await server.open();
  return server;
}
```

#### Publishing and Subscribing to Messages

```javascript
import { Publisher, Subscriber, Message } from 'taulukko-messages';

//Publishing
async function publishMessage() {
  const publisher = Publisher.create({ 
    topics: ["topic.helloWorld"]
  });
  await publisher.open();
   //...
  await publisher.send("Hello World");
   //...
  await publisher.close();
}

// Subscribing
async function subscribeToTopic() {
  const subscriber = Subscriber.create({ 
    topics: ["topic.helloWorld"],
  });
  await subscriber.open();

  subscriber.on( (message: Message) => {
      console.log(`Received message on ${message.topic}: ${message.data}`);
    });

  //...
   await subscriber.close();
}
```
### Documentation

For detailed information on how to use and contribute to the project, please refer to the documentation available on the GitHub Wiki page of this project. You can find it at [the GitHub Wiki page of Taulukko Message](https://github.com/Taulukko/taulukko-messages/wiki).

---

### Contributions

This is an open source project and contributions are welcome! If you would like to contribute, please fork the repository, make your changes, and submit a Pull Request with your modifications.

### License

This project is licensed under the Creative Commons MIT License - see the LICENSE file for more details.

---

For more information, visit [the project repository on GitHub](https://github.com/Taulukko/taulukko-messages).
 
