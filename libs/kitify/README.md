# kitify

[![version][npm-image]][npm-url]
[![CI status][github-action-image]][github-action-url]
[![codecov][codecov-image]][codecov-url]
[![downloads][downloads-image]][npm-url]
[![size][bundlephobia-image]](https://bundlephobia.com/package/kitify)
[![browsers](https://img.shields.io/badge/Browser-IE9-brightgreen?style=flat-square)][github-url]

[github-url]: https://github.com/Marinerer/jotter/blob/main/libs/kitify
[npm-url]: https://www.npmjs.com/package/kitify
[npm-image]: https://img.shields.io/npm/v/kitify?style=flat-square
[github-action-image]: https://img.shields.io/github/actions/workflow/status/Marinerer/jotter/release.yml?style=flat-square
[github-action-url]: https://github.com/Marinerer/jotter/actions/workflows/release.yml
[codecov-image]: https://codecov.io/gh/Marinerer/jotter/graph/badge.svg?token=G7QXEHCEXW
[codecov-url]: https://codecov.io/gh/Marinerer/jotter
[downloads-image]: https://img.shields.io/npm/dm/kitify?style=flat-square
[bundlephobia-image]: https://img.shields.io/bundlephobia/minzip/kitify?style=flat-square

`kitify` (`kit + ify`) is a JavaScript utility library that provides a whole mess of useful helper functions and supports modularity.

`kitify` 是一个 JavaScript 工具函数包，它提供了一大堆有用的辅助工具函数, 并支持模块化。

## Installation

```bash
npm install kitify
```

## Usage

```js
import { isType, isObject, isFunction } from 'kitify'
// or
import { isType, isObject, isFunction } from 'kitify/type'

isObject({}) // true
isFunction(() => {})) // true
isType(123) // number
isType('hello', 'string') // true
```

## API

### type

```js
import { isType } from 'kitify/type'

console.log(isType({})) // object
console.log(isType([], 'array')) // true
```

## License

MIT License

## Contributing

Contributions are welcome! Please feel free to submit a [Pull Request](https://github.com/Marinerer/jotter/pulls).
