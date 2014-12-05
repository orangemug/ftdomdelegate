# domdelegate [![Build Status](https://travis-ci.org/orangemug/domdelegate.svg?branch=master)](https://travis-ci.org/orangemug/domdelegate)

It's a fork of [ftdomdelegate](https://github.com/ftlabs/ftdomdelegate) with a few extra features planned

 * Scoped selectors
 * Moving away from buster to mocha
 * Simplify the code a little with some better documentation
 * Match the API of other delegate libraries better
 * Proof that its tested in the browsers listed (saucelabs)


domdelegate is a simple, easy-to-use component for binding to events on all target elements matching the given selector, irrespective of whether anything exists in the DOM at registration time or not. This allows developers to implement the [event delegation pattern](http://www.sitepoint.com/javascript-event-delegation-is-easier-than-you-think/).


## Install
Get the [browserify](http://browserify.org/)-able source from a package manager:

    npm install dom-delegate

or

    bower install dom-delegate


## Usage
The library is written in CommonJS and so can either be `require` in or the prebuilt wzrd.in version can be used, which makes the API available via `window.domDelegate.Delegate`.

    var delegate, Delegate, myDel;

    Delegate = require('dom-delegate').Delegate;
    myDel = new Delegate(document.body);


The script must be loaded prior to instantiating a Delegate object.

To instantiate Delegate on the `body` and listen to some events:

    function handleButtonClicks(event) {
      // Do some things
    }

    function handleTouchMove(event) {
      // Do some other things
    }

    window.addEventListener('load', function() {
      var delegate = new Delegate(document.body);
      delegate.on('click', 'button', handleButtonClicks);

      // Listen to all touch move
      // events that reach the body
      delegate.on('touchmove', handleTouchMove);

    }, false);

A cool trick to handle images that fail to load:

    function handleImageFail() {
      this.style.display = 'none';
    }

    window.addEventListener('load', function() {
      var delegate = new Delegate(document.body);
      delegate.on('error', 'img', handleImageFail);
    }, false);

Note: as of 0.1.2 you do not need to provide a DOM element at the point of instantiation, it can be set later via the `root` method.

Also note: as of 0.2.0 you cannot specify more than one `eventType` in a single call to `off` or `on`.


## Tests
Tests are run using [buster](http://docs.busterjs.org/en/latest/) and sit in `test/`. To run the tests statically:

    $ cd ftdomdelegate/
    $ ./node_modules/.bin/buster-static -c test/buster.js
    Starting server on http://localhost:8282/

...then point your browser to http://localhost:8282/.

    $ ./node_modules/.bin/buster-server
    buster-server running on http://localhost:1111

Point your browser to http://localhost:1111 and capture it, then in another terminal tab:

    $ ./node_modules/.bin/buster-test -c test/buster.js

Code coverage is generated automatically with [istanbul](https://github.com/gotwarlost/istanbul).  The report outputs to `lcov-report/index.html`.


## API

### .on(eventType[, selector], handler[, useCapture])

#### `eventType (string)`

The event to listen for e.g. `mousedown`, `mouseup`, `mouseout`, `error`, `click`, etc.

#### `selector (string)`

Any kind of valid CSS selector supported by [`matchesSelector`](http://caniuse.com/matchesselector). Some selectors, like `#id` or `tag` will use optimized functions internally that check for straight matches between the ID or tag name of elements.

`null` is also accepted and will match the root element set by `root()`.  Passing a handler function into `.on`'s second argument is equivalent to `.on(eventType, null, handler)`.

#### `handler (function)`

Function that will handle the specified event on elements matching the given selector.  The function will receive two arguments: the native event object and the target element, in that order.

#### `useCapture (boolean)`

Whether or not to listen during the capturing (pass in `true`) or bubbling phase (pass in `false`).  If no value passed in, it will fallback to a 'sensible default', which is `true` for `error`, `blur` and `focus` events and `false` for all other types.

### .off([eventType][, selector][, handler][, useCapture])

Calling `off` with no arguments will remove all registered listeners, effectively resetting the instance.

#### `eventType (string)`

Remove handlers for events matching this type considering the other parameters.

#### `selector (string)`

Only remove listeners registered with the given selector, among the other arguments.

If null passed listeners registered to the root element will be removed.  Passing in a function into `off`'s second parameter is equivalent to `.off(eventType, null, handler[, useCapture])` (the third parameter will be ignored).

#### `handler (function)`

Only remove listeners registered with the given handler function, among the other arguments.  If not provided, remove all handlers.

#### `useCapture (boolean)`

Only remove listeners with `useCapture` set to the value passed in.  If not provided, remove listeners added with `useCapture` set to `true` and `false`.

### .root([element])

#### `element (Node)`

Set the delegate's root node.  If no element passed in the root node will be deleted and the event listeners will be removed.

### .destroy()

Short hand for off() and root(), ie both with no parameters. Used to reset the delegate object.

## Credits and collaboration
This was orignally developed by FT Labs, the original developers of ftdomdelegate are [Matthew Andrews](https://twitter.com/andrewsmatt) and [Matthew Caruana Galizia](http://twitter.com/mcaruanagalizia). Test engineering by [Sam Giles](https://twitter.com/SamuelGiles_). The API is influenced by [jQuery Live](http://api.jquery.com/live/).
