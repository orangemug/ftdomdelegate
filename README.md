# dom-delegate [![Build Status](https://travis-ci.org/orangemug/dom-delegate.svg?branch=master)](https:/travis-ci.org/orangemug/dom-delegate)

[![Sauce Test Status](https://saucelabs.com/browser-matrix/orangemug_github.svg)](https://saucelabs.com/u/orangemug_github)

It's a fork of [ftdomdelegate](https://github.com/ftlabs/ftdomdelegate) with a few extra features planned

 * [done] Scoped selectors
 * [done] Moving away from buster to mocha/zuul
 * Proof that its tested in the browsers listed (saucelabs)
 * Match the API of other delegate libraries better

Whats been lost (but will come back in a future version)

 * Code coverage
 * Standalone script (only bower/npm packages at the moment)


dom-delegate is a simple, easy-to-use component for binding to events on all target elements matching the given selector, irrespective of whether anything exists in the DOM at registration time or not. This allows developers to implement the [event delegation pattern](http://www.sitepoint.com/javascript-event-delegation-is-easier-than-you-think/).


## Install
Get the [browserify](http://browserify.org/)-able source from a package manager:

    npm install git://github.com/orangemug/dom-delegate.git


## Usage
To instantiate `Delegate` on the `body` and listen to some events

    var Delegate = require('dom-delegate');

    function handleButtonClicks(event) {
      // Do some things
    }

    function handleTouchMove(event) {
      // Do some other things
    }

    document.addEventListener("DOMContentLoaded", function() {
      var delegate = new Delegate(document.body);
      delegate.on('click', 'button', handleButtonClicks);

      // Listen to all touch move
      // events that reach the body
      delegate.on('touchmove', handleTouchMove);
    }, false);


## Tests
Make sure you have the deps installed

    npm install

Then just run

    npm test

If you want to run the tests in a particular browser just run the following and visit the url in your browser.

    ./node_modules/zuul/bin/zuul --local 5000 test/test.js    



## API

### .on(eventType[, selector], handler[, useCapture])

#### `eventType (string)`

The event to listen for e.g. `mousedown`, `mouseup`, `mouseout`, `error`, `click`, etc.

#### `selector (string)`

Any kind of valid CSS selector supported by [`matchesSelector`](http://caniuse.com/matchesselector). Some selectors, like `#id` or `tag` will use optimized functions internally that check for straight matches between the ID or tag name of elements.

You can also use a direct child selector, which uses the same format as jquery `> childselector`. *Note* this isn't supported by the native querySelector yet so its a slower than the other selectors.

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
