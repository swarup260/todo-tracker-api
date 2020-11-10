const EVENTS = {
  CHAT_MESSAGE: "chat_message",
  USER_TYPING: "user_typing",
  CREATE_ROOM: "create_room",
  JOIN_ROOM: "join_room"
};
const ROOMS = [];
const onConnect = async (socket) => {
  console.log("User Connection");

  socket.on(EVENTS.CREATE_ROOM, async (data) => {
    socket.join(data);
    ROOMS.push(data);
  })

  ROOMS.forEach(room => socket.to(room).emit(EVENTS.JOIN_ROOM, `you are connected ${room}`));

  /* Events */
  socket.on(EVENTS.CHAT_MESSAGE, async (data) => {
    if (data.room) {

      socket.to(data.room).emit(EVENTS.CHAT_MESSAGE, {
        message: data,
        isSend: false,
        time: new Date(),
      });
    }
    if (data.room == undefined) {

      socket.broadcast.emit(EVENTS.CHAT_MESSAGE, {
        message: data,
        isSend: false,
        time: new Date(),
      });
    }
  });

  socket.on(EVENTS.USER_TYPING, async (data) => {
    socket.broadcast.emit(EVENTS.USER_TYPING, data);
  });



};

module.exports = onConnect;