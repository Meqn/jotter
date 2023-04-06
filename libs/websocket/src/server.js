const WebSocket = require('ws');

const port = 30001
const server = new WebSocket.Server({ port });

server.on('listening', () => {
  console.log(`WebSocket server is listening on port ${port}`)
});

server.on('connection', (socket, req) => {
  // const cli = req
  console.log('WebSocket client connected');

  socket.on('error', console.error)

  socket.on('message', (message) => {
    console.log('received: %s', message)

    // Echo the message back to the client
    if(message == 'error') {
      throw new Error('happen unexpectedly')
    } else if (message == 'ping') {
      socket.send('pong')
    } else {
      socket.send(`Echo: ${message}`);
    }
  });

  socket.on('close', () => {
    console.log('WebSocket client disconnected');
  })
})
