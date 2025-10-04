let io;

const setIO = (socketIoInstance) => {
  io = socketIoInstance;
};

const getIO = () => io;

module.exports = { setIO, getIO };


