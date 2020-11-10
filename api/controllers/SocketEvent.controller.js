const EVENTS = {
  CHAT_MESSAGE: "chat_message",
  USER_TYPING: "user_typing",
};
const onConnect = async (socket) => {
  console.log("User Connection");

  /* Events */
  socket.on(EVENTS.CHAT_MESSAGE, async (data) => {
    socket.broadcast.emit(EVENTS.CHAT_MESSAGE, {
      message: data,
      isSend: false,
      time: new Date(),
    });
  });
  
  socket.on(EVENTS.USER_TYPING, async (data) => {
    socket.broadcast.emit(EVENTS.USER_TYPING, data);
  });
};

module.exports = onConnect;
