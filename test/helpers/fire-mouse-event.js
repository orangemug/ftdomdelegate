module.exports = function(target, eventName, relatedTarget) {
  // TODO: Extend this to be slightly more configurable when initialising the event.
  var ev;
  if (document.createEvent) {
    ev = document.createEvent("MouseEvents");
    ev.initMouseEvent(eventName, true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, relatedTarget || null);
    target.dispatchEvent(ev);
  } else if ( document.createEventObject ) {
    ev = document.createEventObject();
    target.fireEvent( 'on' + eventName, ev);
  }
};
