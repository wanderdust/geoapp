function loadSocket () {
  try {
    return socket = socket || io.connect('http://192.168.3.183:3000');
  } catch (e) {
    return socket = {emit: function () {return undefined}, on: function () {return undefined}, isOnline: false}
  }
};
