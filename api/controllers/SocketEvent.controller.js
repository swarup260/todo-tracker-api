const moment = require("moment");

const EVENTS = {
  CHAT_MESSAGE: "chat_message",
  USER_TYPING: "user_typing",
  USER_JOIN: "user_join",
  CREATE_ROOM: "create_room",
  JOIN_ROOM: "join_room",
};
const ROOMS = [];
const onConnect = async (socket) => {
  console.log("User Connection");

  socket.on(EVENTS.CREATE_ROOM, async (data) => {
    console.log(data);
    if (!ROOMS.includes(data)) {
      socket.join(data);
      ROOMS.push(data);
    }
  });

  socket.on(EVENTS.USER_JOIN, async ({ username, room }) => {
    const payload = {
      message: `${username} joined`,
      user: socket.id,
      username: username,
      time: moment().format("HH:MM a"),
    };

    if (room != "") {
      socket.to(room).broadcast.emit(EVENTS.JOIN_ROOM, payload);
    }
    // if (room == "") {
    //   socket.broadcast.emit(EVENTS.JOIN_ROOM, payload);
    // }
  });

  /* Events */
  socket.on(EVENTS.CHAT_MESSAGE, async ({ message, room, username }) => {
    const payload = {
      message: message,
      user: socket.id,
      username: username,
      time: moment().format("HH:MM a"),
    };
    if (!room) {
      socket.emit(EVENTS.CHAT_MESSAGE, payload);
      socket.broadcast.emit(EVENTS.CHAT_MESSAGE, payload);
    }
    if (room) {
      socket.to(room).emit(EVENTS.CHAT_MESSAGE, payload);
      socket.to(room).broadcast.emit(EVENTS.CHAT_MESSAGE, payload);
    }
    // if (data.room) {
    //   socket.to(data.room).emit(EVENTS.CHAT_MESSAGE, {
    //     message: data,
    //     user: socket.id,
    //     time: moment().format("HH:MM a"),
    //   });
    // }
    // if (data.room == undefined) {
    //   socket.emit(EVENTS.CHAT_MESSAGE, {
    //     message: data,
    //     user: socket.id,
    //     time: moment().format("HH:MM a"),
    //   });
    // }
  });

  socket.on(EVENTS.USER_TYPING, async (data) => {
    socket.broadcast.emit(EVENTS.USER_TYPING, data);
  });
};

module.exports = onConnect;
