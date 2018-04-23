function loadSocket () {
  // Locks screen orientation to portrait
  document.addEventListener("deviceready", () => {screen.orientation.lock('portrait')}, false);

  try {
    return socket = socket || io.connect('http://192.168.1.154:1337/');
  } catch (e) {
    return socket = {emit: function () {return undefined}, on: function () {return undefined}, isOnline: false}
  }
};
