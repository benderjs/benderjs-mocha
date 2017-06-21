# benderjs-mocha

Adapter for [Mocha](http://mochajs.org/) testing framework for [Bender.js](https://github.com/benderjs/benderjs).

## Installation

```
npm install benderjs-mocha
```

## Usage

Add `benderjs-mocha` to the `plugins` array in your `bender.js` configuration file:

```javascript
var config = {
    applications: {...}

    browsers: [...],

    plugins: ['benderjs-mocha'], // load the plugin

    tests: {...}
};

module.exports = config;
```

Set `mocha` as a `framework` for the entire project or just a specific tests group:

```javascript
var config = {
    applications: {...}

    browsers: [...],

    framework: 'mocha', // use for entire project

    plugins: ['benderjs-mocha'],

    tests: {
        Foo: {
            basePath: '',
            framework: 'mocha' // use for a specific tests group
            paths: [...]
        }
    }
};

module.exports = config;
```

## Configuration

You can set some of Mocha's options using `bender.js` configuration file.

```javascript
var config = {
    applications: {...}

    browsers: [...],

    framework: 'mocha',

    // configure Mocha
    mocha: {
        ui: 'tdd'
    },

    plugins: ['benderjs-mocha'],

    tests: {...}
};

module.exports = config;
```

###Available options:

- *String* `ui` - Mocha's interface, possible values: `bdd`, `tdd` or `exports`. Default: `bdd`
- *Number* `timeout` - test case timeout in milliseconds. Default: `2000`
- *String|RegExp* `grep` - will only run tests matching the given pattern, this could break some of Bender's default behaviours ,so please use it at your own risk

## Features
- single test run support

## License

MIT, for license details see: [LICENSE.md](https://github.com/benderjs/benderjs-chai/blob/master/LICENSE.md).
