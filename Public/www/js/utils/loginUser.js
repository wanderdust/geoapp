function loginUser (socket, uuid) {
  socket.emit('passwordlessLogin', {
    uuid: uuid
  }, (err, res) => {
    if (err)
      return window.location.href = 'sign-in.html';

    localStorage.setItem('userUuidGeoapp', res.uuid);
    sessionStorage.setItem('userId', res._id);
    window.location.href = 'main.html#/online'
  })
}
