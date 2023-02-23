# EventEmitter

Simple and modern event emitter library.



## Install

```
npm install @jotter/emitter
```



## Usage

```js
import EventEmitter from '@jotter/emitter'

const emitter = new EventEmitter()

function onMessage(data) {
  console.log(data)
}

emitter.on('message', onMessage)

emitter.on('message', function() {
  console.log('message....')
})

emitter.emit('message', 'hello')
// hello
// message....

emitter.off('message', onMessage)
```

## Instance Methods

### on(type, listener[, context])

### once(type, listener[, context])

### emit((type[, arguments...])

### off(type[, listener])

### clear([, type])

### has(type)

### get([, type])



## Thanks
[tiny-emitter](https://github.com/scottcorgan/tiny-emitter) ,  [pico-emitter](https://github.com/hkk12369/pico-emitter) ,  [emittery](https://github.com/sindresorhus/emittery) , [mitt](https://github.com/developit/mitt)
