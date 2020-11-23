/* dependencies */
const socketio = require('socket.io')
/* custom dependencies  */
const {
  getFormatedMessage
} = require("../helpers/function.helper");
/* constants */
const EVENTS = {
  CHAT_MESSAGE: "chat_message",
  USER_TYPING: "user_typing",
  USER_JOIN: "user_join",
  CREATE_ROOM: "create_room",
  JOIN_ROOM: "join_room",
};
const ROOMS = [];

const SOCKETS = {};

SOCKETS.init = function (server) {
  /* initialization socket */
  const io = socketio(server, {
    transports: ["websocket", "polling"]
  });
  io.on("connection", async (socket) => {
    /* create rooms */
    socket.on(EVENTS.CREATE_ROOM, ({
      roomName
    }) => {
      if (!ROOMS.includes(roomName)) {
        socket.join(roomName);
      }
    });

    socket.on(EVENTS.JOIN_ROOM, ({
      user,
      roomName
    }) => {
      socket.to(roomName).emit(EVENTS.JOIN_ROOM, {
        message: `${user} join`
      });
    });

    socket.on(EVENTS.CHAT_MESSAGE, (payload) => {
      io.in(payload.roomName).emit(EVENTS.CHAT_MESSAGE, getFormatedMessage(payload));
    });
  })
}

module.exports = SOCKETS;