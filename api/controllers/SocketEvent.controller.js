/* custom dependencies  */
const { getFormatedMessage } = require("../helpers/function.helper");
/* constants */
const EVENTS = {
  CHAT_MESSAGE: "chat_message",
  USER_TYPING: "user_typing",
  USER_JOIN: "user_join",
  CREATE_ROOM: "create_room",
  JOIN_ROOM: "join_room",
};
const ROOMS = [];

/* main events */
const onConnect = async (socket) => {
  /* create rooms */
  socket.on(EVENTS.CREATE_ROOM, ({ roomName }) => {
    if (!ROOMS.includes(roomName)) {
      socket.join(roomName);
    }
  });

  socket.on(EVENTS.JOIN_ROOM, ({ user, roomName }) => {
    if (!roomName) {
      socket.broadcast.emit(EVENTS.JOIN_ROOM, { message: `${user} join` });
    }
    if (roomName) {
      socket.to(roomName).emit(EVENTS.JOIN_ROOM, { message: `${user} join` });
    }
  });

  socket.on(EVENTS.CHAT_MESSAGE, (payload) => {
    if (!payload.roomName) {
      socket.emit(EVENTS.CHAT_MESSAGE, getFormatedMessage(payload));
      socket.broadcast.emit(EVENTS.CHAT_MESSAGE, getFormatedMessage(payload));
    }
    if (payload.roomName) {
      socket.to(payload.roomName).emit(EVENTS.CHAT_MESSAGE, getFormatedMessage(payload));
      // io.in
    }
  });
};

module.exports = onConnect;
