module.exports = function (target, eventName) {
  var ev;
  if (document.createEvent) {
    ev = document.createEvent('Event');
    ev.initEvent(eventName, true, true);
    target.dispatchEvent(ev);
  } else if ( document.createEventObject ) {
    ev = document.createEventObject();
    target.fireEvent( 'on' + eventName, ev);
  }
};
