/**
 * @jest-environment jsdom
 */

import WebSocketConnect from '../src/index';
// @ts-ignore
import WebSocketClient from 'ws'

const PORT = 30001
const URL = `ws://localhost:${PORT}/`

// ! ws@version < 8.x
const WebSocketServer = WebSocketClient.Server

describe('WebSocketConnect', () => {
  let socket: WebSocketConnect;

  beforeEach(() => {
    socket = new WebSocketConnect(URL)
  })
  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('should create WebSocket instance', () => {
    expect(socket).toBeInstanceOf(WebSocketConnect);
    expect(socket).toHaveProperty('options');
    expect(socket.ws).not.toBeNull();
    expect(socket.ws).toBeInstanceOf(window.WebSocket)
    expect(socket.url).toBe(URL)
  });

  it('should throw error if no url provided', () => {
    expect(() => new WebSocketConnect('')).toThrow(Error);
    expect(() => new WebSocketConnect({ url: '' })).toThrow(Error);
  });

  it('should throw error if no websocket support in environment', () => {
    const originalWebSocket = (window as any).WebSocket;
    (window as any).WebSocket = undefined;

    expect(() => {
      new WebSocketConnect(URL);
    }).toThrow(Error);

    (window as any).WebSocket = originalWebSocket;
  });

  it('should websocket protocol', (done) => {
    const anyProtocol = 'foo'
    const wss = new WebSocketServer({ port: PORT })
    socket = new WebSocketConnect(URL, anyProtocol)

    socket.addEventListener('open', () => {
      expect(socket.url).toBe(URL)
      expect(socket.protocol).toBe(anyProtocol)
      socket.close()
    })

    socket.addEventListener('close', () => {
      wss.close(() => {
        setTimeout(done, 500);
      })
    })
  })

  it('should open connection', () => {
    const originalWebSocket = (window as any).WebSocket;
    (window as any).WebSocket = jest.fn(() => ({
      binaryType: 'blob',
      readyState: WebSocket.OPEN,
      send: jest.fn(),
      close: jest.fn(),
      onclose: null,
      onerror: null,
      onmessage: null,
      onopen: null,
    }));

    socket.open();
    expect(socket.ws).not.toBeNull();
    expect((window as any).WebSocket).toHaveBeenCalledTimes(1);

    (window as any).WebSocket = originalWebSocket;
  });

  /* it('should add event listener', () => {
    const spyAddEventListener = jest.spyOn(document.createElement('div'), 'addEventListener');

    socket.addEventListener('event', () => {});
    expect(spyAddEventListener).toHaveBeenCalledTimes(1);

    spyAddEventListener.mockReset();
    spyAddEventListener.mockRestore();
  }); */

  it('should add/remove/dispatch event listener', () => {
    const onMessage1 = jest.fn()
    const onMessage2 = jest.fn()

    socket.addEventListener('message', onMessage1)
    socket.addEventListener('message', onMessage2)
    socket.dispatchEvent(new MessageEvent('message', { data: 'Hello' }));
    expect(onMessage1).toHaveBeenCalledWith(expect.any(MessageEvent));
    expect(onMessage1).toHaveBeenCalledTimes(1);
    expect(onMessage2).toHaveBeenCalledWith(expect.any(MessageEvent));
    expect(onMessage2).toHaveBeenCalledTimes(1);

    socket.removeEventListener('message', onMessage1)
    socket.dispatchEvent(new MessageEvent('message', { data: 'world' }));
    expect(onMessage1).toHaveBeenCalledTimes(1);
    expect(onMessage2).toHaveBeenCalledTimes(2);
  });

  it('connection status constants', (done) => {
    const wss = new WebSocketServer({ port: PORT })
    socket = new WebSocketConnect(URL)

    expect(WebSocketConnect.CONNECTING).toBe(0)
    expect(WebSocketConnect.OPEN).toBe(1)
    expect(WebSocketConnect.CLOSING).toBe(2)
    expect(WebSocketConnect.CLOSED).toBe(3)
    
    expect(socket.CONNECTING).toBe(0)
    expect(socket.OPEN).toBe(1)
    expect(socket.CLOSING).toBe(2)
    expect(socket.CLOSED).toBe(3)

    socket.addEventListener('open', () => {
      expect(socket.readyState).toBe(1)
      socket.close()
    })
    socket.addEventListener('close', () => {
      expect(socket.readyState).toBe(0) // CLOSED, //! WebSocket.CONNECTING = 0
      wss.close(() => {
        setTimeout(done, 500)
      })
    })
  })

  /* it('should set message queue on sending message when connection is not open', () => {
    socket.send('message');
    expect(socket._messageQueue).toContain('message');
    expect(socket._messageQueue.size).toBe(1);
  }); */

  it('should send message if connection is open', () => {
    const spySend = jest.fn();
    // @ts-ignore
    socket.ws = {
      binaryType: 'blob',
      readyState: WebSocket.OPEN,
      send: spySend,
      close: jest.fn(),
      onclose: null,
      onerror: null,
      onmessage: null,
      onopen: null,
    };

    socket.send('message');
    expect(spySend).toHaveBeenCalledTimes(1);
    expect(spySend).toHaveBeenCalledWith('message');
  });

  /* it('should reconnect on close', () => {
    socket.options.shouldReconnect = true;
    socket._resetReconnect = jest.fn();
    socket.reconnect(new CloseEvent('close'));

    expect(socket._resetReconnect).toHaveBeenCalledTimes(1);
  }); */

  /* it('should not reconnect if shouldReconnect is false', () => {
    socket.options.shouldReconnect = false;
    socket._resetReconnect = jest.fn();
    socket.reconnect(new CloseEvent('close'));

    expect(socket._resetReconnect).toHaveBeenCalledTimes(0);
  }); */

  /* it('should not reconnect if connection is intentionally closed', () => {
    socket.options.shouldReconnect = true;
    socket._resetReconnect = jest.fn();
    socket.reconnect(new CloseEvent('close', { code: WebSocket.CONNECTING }));

    expect(socket._resetReconnect).toHaveBeenCalledTimes(0);
  }); */

  it('should close websocket', () => {
    const spyClose = jest.fn();
    // @ts-ignore
    socket.ws = {
      binaryType: 'blob',
      readyState: WebSocket.CLOSING,
      send: jest.fn(),
      close: spyClose,
      onclose: null,
      onerror: null,
      onmessage: null,
      onopen: null,
    };

    socket.close(1000, 'reason');
    expect(spyClose).toHaveBeenCalledTimes(1);
    expect(spyClose).toHaveBeenCalledWith(1000, 'reason');
    expect(socket.ws).toBeNull();
  });

});
