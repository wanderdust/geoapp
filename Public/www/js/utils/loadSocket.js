function loadSocket () {
  try {
    return socket = socket || io.connect('http://10.40.40.54:3000');
  } catch (e) {
    return socket = {emit: function () {return undefined}, on: function () {return undefined}, isOnline: false}
  }
};
