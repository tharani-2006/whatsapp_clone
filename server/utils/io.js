let ioInstance = null;

function setIO(io) {
  ioInstance = io;
}

function getIO() {
  if (!ioInstance) throw new Error('Socket.io instance not set');
  return ioInstance;
}

module.exports = { setIO, getIO };


