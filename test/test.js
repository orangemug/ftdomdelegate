/*jshint laxbreak:true*/
var assert = require("assert");
var sinon = require("sinon");
var Delegate = require("../");

// For phantomjs
require("polyfill-function-prototype-bind");

var fireMouseEvent = require("./helpers/fire-mouse-event");
var fireFormEvent  = require("./helpers/fire-form-event");

describe("domdelgate", function() {
  beforeEach(function() {
    document.body.insertAdjacentHTML('beforeend',
      '<div id="container1">'
        + '<div id="delegate-test-clickable" class="delegate-test-clickable">'
          + '<div id="delegate-test-inner-clickable"></div>'
        + '</div>'
        + '<div id="another-delegate-test-clickable"><input id="js-input" /></div>'
      + '</div>'
      + '<div id="container2">'
        + '<div id="element-in-container2-test-clickable" class="delegate-test-clickable"></div>'
      + '</div>'
      + '<svg viewBox="0 0 120 120" version="1.1" xmlns="http://www.w3.org/2000/svg">'
        + '<circle id="svg-delegate-test-clickable" cx="60" cy="60" r="50"/>'
      + '</svg>'
    );
  });

  afterEach(function() {
    var toRemove;
    toRemove = document.getElementById('container1');
    if (toRemove) {
      toRemove.parentNode.removeChild(toRemove);
    }
    toRemove = document.getElementById('container2');
    if (toRemove) {
      toRemove.parentNode.removeChild(toRemove);
    }
  });


  it('Delegate#off should remove the event handlers for a selector', function() {
    var delegate = new Delegate(document);
    var spyA = sinon.spy()
    var spyB = sinon.spy();

    delegate.on('click', '#delegate-test-clickable', spyA);
    delegate.on('click', '#delegate-test-clickable', spyB);

    var element = document.getElementById("delegate-test-clickable");

    fireMouseEvent(element, "click");

    assert.equal(spyA.callCount, 1);
    assert.equal(spyB.callCount, 1);

    delegate.off("click", '#delegate-test-clickable');

    fireMouseEvent(element, "click");

    assert.equal(spyA.callCount, 1);
    assert.equal(spyB.callCount, 1);
  });

  it('ID selectors are supported', function() {
    var delegate, spy, element;

    delegate = new Delegate(document);
    spy = sinon.spy();
    delegate.on('click', '#delegate-test-clickable', spy);

    element = document.getElementById('delegate-test-clickable');
    fireMouseEvent(element, 'click');

    assert.equal(spy.callCount, 1);

    delegate.off();
  });

  it('Destroy destroys', function() {
    var delegate, spy, element;

    delegate = new Delegate(document);
    spy = sinon.spy();
    delegate.on('click', '#delegate-test-clickable', spy);

    delegate.destroy();

    element = document.getElementById('delegate-test-clickable');
    fireMouseEvent(element, 'click');

    assert(!spy.called);
  });

  it('Tag selectors are supported', function() {
    var delegate, spy, element;

    delegate = new Delegate(document);
    spy = sinon.spy();
    delegate.on('click', 'div', function (event) {
      spy();
      return false;
    });

    element = document.getElementById('delegate-test-clickable');
    fireMouseEvent(element, 'click');

    assert.equal(spy.callCount, 1);

    delegate.off();
  });

  it('Tag selectors are supported for svg', function() {
    var delegate, spy, element;

    delegate = new Delegate(document);
    spy = sinon.spy();
    delegate.on('click', 'circle', function (event) {
      spy();
      return false;
    });

    element = document.getElementById('svg-delegate-test-clickable');
    fireMouseEvent(element, 'click');

    assert.equal(spy.callCount, 1);

    delegate.off();
  });

  it('Scoped direct children selectors are supported', function() {
    var delegate, spy1, spy2, element;
    var containerEl = document.getElementById("container1");

    spy1 = sinon.spy();
    spy2 = sinon.spy();

    delegate = new Delegate(containerEl);
    delegate.on('click', '> #delegate-test-clickable', function (event) {
      spy1();
    });

    delegate.on('click', '> #delegate-test-inner-clickable', function (event) {
      spy2();
    });

    element = document.getElementById('delegate-test-clickable');
    fireMouseEvent(element, 'click');

    element = document.getElementById('delegate-test-inner-clickable');
    fireMouseEvent(element, 'click');

    assert.equal(spy1.callCount, 2);
    assert.equal(spy2.callCount, 1);

    delegate.off();
  });

  it('Scoped selector changing root', function() {
    var delegate, spy, element;
    var container1El = document.getElementById("container1");
    var container2El = document.getElementById("container2");

    spy = sinon.spy();

    delegate = new Delegate(container1El);
    delegate.on('click', '> .delegate-test-clickable', function (event) {
      spy();
    });

    element = container1El.querySelector('.delegate-test-clickable');
    fireMouseEvent(element, 'click');

    delegate.root(container2El);

    element = container2El.querySelector('.delegate-test-clickable');
    fireMouseEvent(element, 'click');

    assert.equal(spy.callCount, 2);

    delegate.off();
  });

  it('Class name selectors are supported' , function() {
    var delegate, spy, element;

    delegate = new Delegate(document);
    spy = sinon.spy();
    delegate.on('click', '.delegate-test-clickable', spy);

    element = document.getElementById('delegate-test-clickable');
    fireMouseEvent(element, 'click');

    assert.equal(spy.callCount, 1);

    delegate.off();
  });

  it('Complex selectors are supported' , function() {
    var delegate, spyA, spyB, element;

    delegate = new Delegate(document);
    spyA = sinon.spy();
    spyB = sinon.spy();
    delegate.on('click', 'div.delegate-test-clickable, div[id=another-delegate-test-clickable]', spyA);
    delegate.on('click', 'div.delegate-test-clickable + #another-delegate-test-clickable', spyB);

    element = document.getElementById('another-delegate-test-clickable');
    fireMouseEvent(element, 'click');

    assert.equal(spyA.callCount, 1);
    assert.equal(spyB.callCount, 1);

    delegate.off();
  });
  it('If two click handlers are registered then all handlers should be called on click' , function() {
    var delegate = new Delegate(document);
    var spyA = sinon.spy(), spyB = sinon.spy();

    delegate.on("click", '#delegate-test-clickable', spyA);
    delegate.on("click", '#delegate-test-clickable', spyB);

    var element = document.getElementById('delegate-test-clickable');
    fireMouseEvent(element, "click");

    assert.equal(spyA.callCount, 1);
    assert.equal(spyB.callCount, 1);

    delegate.off();
  });

  it('Returning false from a callback should stop propagation immediately', function() {
    var delegate = new Delegate(document);

    var spyA = sinon.spy(), spyB = sinon.spy();

    delegate.on("click", '#delegate-test-clickable', function() {
      spyA();

      // Return false to stop propagation
      return false;
    });
    delegate.on("click", '#delegate-test-clickable', spyB);

    var element = document.getElementById('delegate-test-clickable');
    fireMouseEvent(element, "click");

    assert.equal(spyA.callCount, 1);
    assert.notEqual(spyB.callCount, 1);

    delegate.off();
  });

  it('Returning false from a callback should preventDefault', function(done) {
    var delegate = new Delegate(document.body);

    var spyA = sinon.spy();

    delegate.on("click", '#delegate-test-clickable', function(event) {
      spyA();

      // event.defaultPrevented appears to have issues in IE so just mock
      // preventDefault instead.
      var defaultPrevented;
      event.preventDefault = function() {
        defaultPrevented = true;
      };

      setTimeout(function() {
        assert.equal(defaultPrevented, true);
        done();
      }, 0);

      return false;
    });

    var element = document.getElementById('delegate-test-clickable');
    fireMouseEvent(element, "click");

    assert.equal(spyA.callCount, 1);
    delegate.off();
  });

  it('Returning false from a callback should stop propagation globally', function() {
    var delegateA = new Delegate(document), delegateB = new Delegate(document);

    var spyA = sinon.spy(), spyB = sinon.spy();

    delegateA.on("click", '#delegate-test-clickable', function() {
      spyA();

      // Return false to stop propagation to other delegates
      return false;
    });
    delegateB.on("click", '#delegate-test-clickable', spyB);

    var element = document.getElementById('delegate-test-clickable');
    fireMouseEvent(element, "click");

    assert.equal(spyA.callCount, 1);
    assert.notEqual(spyB.callCount, 1);

    delegateA.off();
    delegateB.off();
  });

  it('Clicking on parent node should not trigger event' , function() {
    var delegate = new Delegate(document);
    var spy = sinon.spy();

    delegate.on("click", "#delegate-test-clickable", spy);

    fireMouseEvent(document, "click");

    assert(!spy.called);

    var spyA = sinon.spy();

    delegate.on("click", "#another-delegate-test-clickable", spyA);

    var element = document.getElementById("another-delegate-test-clickable");
    fireMouseEvent(element, "click");

    assert.equal(spyA.callCount, 1);
    assert.notEqual(spy.callCount, 1);

    delegate.off();
  });

  it('Exception should be thrown when no handler is specified in Delegate#on' , function() {

    try {
      var delegate = new Delegate(document);
      delegate.on("click", '#delegate-test-clickable');
    } catch (e) {
      assert.equal(e.name, 'TypeError')
      assert.equal(e.message, 'Handler must be a type of Function');
    }
  });

  it('Delegate#off with zero arguments should remove all handlers' , function() {
    var delegate = new Delegate(document);
    var spyA = sinon.spy(), spyB = sinon.spy();

    delegate.on('click', '#delegate-test-clickable', spyA);
    delegate.on('click', '#another-delegate-test-clickable', spyB);

    delegate.off();

    var element = document.getElementById('delegate-test-clickable'),
      element2 = document.getElementById('another-delegate-test-clickable');

    fireMouseEvent(element, "click");
    fireMouseEvent(element2, "click");

    assert(!spyA.called);
    assert(!spyB.called);

    spyA.reset();
    spyB.reset();

    fireMouseEvent(element, "mouseover", document);
    fireMouseEvent(element2, "mouseover", document);

    assert(!spyA.called);
    assert(!spyB.called);
  });

  it('Regression test: Delegate#off called from a callback should succeed without exception' , function() {
    var delegate = new Delegate(document);
    var spyA = sinon.spy();

    delegate.on('click', '#delegate-test-clickable', function() {
      spyA();
      delegate.off();
    });

    var element = document.getElementById('delegate-test-clickable');

    fireMouseEvent(element, 'click');
    assert(spyA.called);
  });

  it('Delegate#off called from a callback should prevent execution of subsequent callbacks' , function() {
    var delegate = new Delegate(document);
    var spyA = sinon.spy(), spyB = sinon.spy();

    delegate.on('click', '#delegate-test-clickable', function() {
      spyA();
      delegate.off();
    });
    delegate.on('click', '#delegate-test-clickable', spyB);

    var element = document.getElementById('delegate-test-clickable');

    fireMouseEvent(element, 'click');

    assert(spyA.called);
    assert(!spyB.called);
  });

  it('Can be instantiated without a root node' , function() {
    var delegate = new Delegate();
    var spyA = sinon.spy();
    var element = document.getElementById('delegate-test-clickable');

    delegate.on('click', '#delegate-test-clickable', function(event) {
      spyA();
    });

    fireMouseEvent(element, 'click');
    assert(!spyA.called);
    delegate.off();
  });

  it('Can be bound to an element after its event listeners have been set up' , function() {
    var delegate = new Delegate();
    var spyA = sinon.spy();
    var element = document.getElementById('delegate-test-clickable');

    delegate.on('click', '#delegate-test-clickable', function(event) {
      spyA();
    });

    fireMouseEvent(element, 'click');
    delegate.root(document);
    fireMouseEvent(element, 'click');
    assert.equal(spyA.callCount, 1);
    delegate.off();
  });

  it('Can be unbound from an element' , function() {
    var delegate = new Delegate(document);
    var spyA = sinon.spy();
    var element = document.getElementById('delegate-test-clickable');

    delegate.on('click', '#delegate-test-clickable', function(event) {
      spyA();
    });

    delegate.root();
    fireMouseEvent(element, 'click');
    assert(!spyA.called);
    delegate.off();
  });

  it('Can be to bound to a different DOM element', function () {
    var spyA = sinon.spy();
    var element = document.getElementById('element-in-container2-test-clickable');

    // Attach to the first container
    var delegate = new Delegate(document.getElementById('container1'));

    // Listen to elements with class delegate-test-clickable
    delegate.on('click', '.delegate-test-clickable', function(event) {
      spyA();
    });

    // Click the element in the second container
    fireMouseEvent(element, 'click');

    // Ensure no click was caught
    assert(!spyA.called);

    // Move the listeners to the second container
    delegate.root(document.getElementById('container2'));

    // Click the element in the second container again
    fireMouseEvent(element, 'click');

    // Ensure the click was caught
    assert.equal(spyA.callCount, 1);

    delegate.off();
  });

  it('Regression test: event fired on a text node should bubble normally' , function() {
    var delegate, spy, element, textNode;

    spy = sinon.spy();

    delegate = new Delegate(document);
    delegate.on('click', '#delegate-test-clickable', spy);

    element = document.getElementById('delegate-test-clickable');
    textNode = document.createTextNode('Test text');
    element.appendChild(textNode);

    fireMouseEvent(textNode, 'click');

    assert(spy.called);

    delegate.off();
  });

  // Regression test for - https://github.com/ftlabs/dom-delegate/pull/10
  it('Regression test: event listener should be rebound after last event is removed and new events are added.' , function() {
    var delegate, spy, element, textNode;

    spy = sinon.spy();

    delegate = new Delegate(document);
    delegate.on('click', '#delegate-test-clickable', spy);

    // Unbind event listeners
    delegate.off();

    delegate.on('click', '#delegate-test-clickable', spy);

    element = document.getElementById('delegate-test-clickable');

    fireMouseEvent(element, 'click');

    assert(spy.called);

    delegate.off();
  });

  // Test for issue #5
  it('The root element, via a null selector, is supported', function() {
    var delegate, spy, element;

    delegate = new Delegate(document.body);
    spy = sinon.spy();
    delegate.on('click', null, spy);

    element = document.body;
    fireMouseEvent(element, 'click');

    assert.equal(spy.callCount, 1);

    delegate.off();
  });

  // Test for issues #16
  it('The root element, when passing a callback into the second parameter, is supported', function() {
    var delegate, spy, element;

    delegate = new Delegate(document.body);
    spy = sinon.spy();
    delegate.on('click', spy);

    element = document.body;
    fireMouseEvent(element, 'click');

    assert.equal(spy.callCount, 1);

    delegate.off();
  });

  // Test for issue #16
  it('Can unset a listener on the root element when passing the callback into the second parameter', function() {
    var element = document.getElementById('element-in-container2-test-clickable');
    var delegate = new Delegate(document.body);
    var spy = sinon.spy();
    var spy2 = sinon.spy();

    delegate.on('click', spy);
    delegate.on('click', '#element-in-container2-test-clickable', spy2);

    fireMouseEvent(element, 'click');
    delegate.off('click', spy);
    fireMouseEvent(element, 'click');

    assert.equal(spy.callCount, 1);
    assert.equal(spy2.callCount, 2);

    delegate.off();
  });

  it('Regression test: #root is chainable during setting of root', function() {
    var delegate, spy, element;

    delegate = new Delegate();
    spy = sinon.spy();
    delegate.root(document.body).on('click', null, spy);

    element = document.body;
    fireMouseEvent(element, 'click');
    assert.equal(spy.callCount, 1);
    delegate.off();
  });

  it('Regression test: #root is chainable during unsetting of root', function() {
    var delegate, spy, element;

    delegate = new Delegate(document.body);
    spy = sinon.spy();
    delegate.root().on('click', null, spy);
    delegate.root(document.body);

    element = document.body;
    fireMouseEvent(element, 'click');
    assert.equal(spy.callCount, 1);
    delegate.off();
  });

  it('Focus events can be caught', function() {
    var delegate, spy, spy2, element, ev;

    delegate = new Delegate(document.body);
    spy = sinon.spy();
    spy2 = sinon.spy();
    delegate.on('focus', 'input', spy);
    element = document.getElementById('js-input');
    fireFormEvent(element, 'focus');
    assert.equal(spy.callCount, 1);
  });

  it('Blur events can be caught', function() {
    var delegate, spy, spy2, element, ev;

    delegate = new Delegate(document.body);
    spy = sinon.spy();
    spy2 = sinon.spy();
    delegate.on('blur', 'input', spy);
    element = document.getElementById('js-input');
    fireFormEvent(element, 'blur');
    assert.equal(spy.callCount, 1);
  });

  it('Test setting useCapture true false works get attached to capturing and bubbling event handlers, respectively' , function() {
    var delegate = new Delegate(document);
    var bubbleSpy = sinon.spy();
    var captureSpy = sinon.spy();
    var bubblePhase;
    var capturePhase;

    delegate.on('click', '.delegate-test-clickable', function(event) {
      bubblePhase = event.eventPhase;
      bubbleSpy();
    }, false);
    delegate.on('click', '.delegate-test-clickable', function(event) {
      capturePhase = event.eventPhase;
      captureSpy();
    }, true);

    var element = document.getElementById('delegate-test-clickable');
    fireMouseEvent(element, 'click');

    assert.equal(1, capturePhase);
    assert.equal(3, bubblePhase);
    sinon.assert.callOrder(captureSpy, bubbleSpy);

    // Ensure unbind works properly
    delegate.off();

    element = document.getElementById('delegate-test-clickable');
    fireMouseEvent(element, 'click');

    assert.equal(captureSpy.callCount, 1);
    assert.equal(bubbleSpy.callCount, 1);
  });

  describe("scroll", function() {
    beforeEach(function() {
      var snip = '<p>text</p>';
      var out = '';
      for (var i = 0, l = 10000; i < l; i++) {
        out += snip;
      }
      document.body.insertAdjacentHTML('beforeend', '<div id="el">'+out+'</div>');
      window.scrollTo(0, 0);
    });

    afterEach(function() {
      var el = document.getElementById('el');
      el.parentNode.removeChild(el);
    });

    it('Test scroll event', function(done) {
      var promise = {
        then: function (callback) {
          this.callbacks = this.callbacks || [];
          this.callbacks.push(callback);
        }
      };

      var delegate = new Delegate(document);
      var windowDelegate = new Delegate(window);
      var spyA = sinon.spy();
      var spyB = sinon.spy();
      delegate.on('scroll', spyA);
      windowDelegate.on('scroll', spyB);

      // Scroll events on some browsers are asynchronous
      window.setTimeout(function() {
        assert.equal(spyA.callCount, 1);
        assert.equal(spyB.callCount, 1);
        delegate.destroy();
        windowDelegate.destroy();

        callbacks = promise.callbacks || [];
        for (var i = 0, l = callbacks.length; i < l; ++i) {
          callbacks[i]();
        }
        done();
      }, 100);
      window.scrollTo(0, 100);
    });

    it('Test sub-div scrolling', function() {
      var promise = {
        then: function (callback) {
          this.callbacks = this.callbacks || [];
          this.callbacks.push(callback);
        }
      };

      var delegate = new Delegate(document);
      var el = document.getElementById('el');
      el.style.height = '100px';
      el.style.overflow = 'scroll';

      var spyA = sinon.spy();
      delegate.on('scroll', '#el', spyA);

      // Scroll events on some browsers are asynchronous
      window.setTimeout(function() {
        assert.equal(spyA.callCount, 1);
        delegate.destroy();

        callbacks = promise.callbacks || [];
        for (var i = 0, l = callbacks.length; i < l; ++i) {
          callbacks[i]();
        }
      }, 100);
      var event = document.createEvent("MouseEvents");
      event.initMouseEvent('scroll', true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
      el.dispatchEvent(event);
      return promise;
    });
  });

});

