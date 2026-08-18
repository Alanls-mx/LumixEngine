(function () {
  var renderHost = 'lumixengine-frontend.onrender.com';
  var canonicalOrigin = 'https://lumixengine.com';

  if (window.location.hostname !== renderHost) {
    return;
  }

  window.location.replace(
    canonicalOrigin + window.location.pathname + window.location.search + window.location.hash,
  );
})();
