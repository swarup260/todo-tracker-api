import * as func from "./helpers";
import * as sessionStorage from "./sessionStorage";

const BASE_URL = "http://localhost:3000";

/* ---------------------------------------------------------- */
/*                 SOCKET INITIALIZATION                      */
/* ---------------------------------------------------------- */
const socket = io(BASE_URL);

/* ---------------------------------------------------------- */
/*                 SELECTORS                                  */
/* ---------------------------------------------------------- */
const joinScreen = document.querySelector("#joinScreen");
const chatBoxScreen = document.querySelector("#chatBoxScreen");
const joinChatBtn = document.querySelector("#joinChat");
const userNameInput = document.querySelector("#userName");
const roomNameInput = document.querySelector("#roomName");

const chatHistoryBox = document.querySelector("#chatHistory");
const messageInput = document.querySelector("#message");
const sendMessageBtn = document.querySelector("#sendMessage");
const cardTitle = document.querySelector("span#chatBoxTitle");

/* ---------------------------------------------------------- */
/*                 DOM EVENTS                                 */
/* ---------------------------------------------------------- */
joinChatBtn.addEventListener("click", function () {
  /* set title */
  cardTitle.textContent = `${
    cardTitle.textContent
  } || User :  ${sessionStorage.getUser()}`;
  /* set user  */
  if (userNameInput.value != "") {
    sessionStorage.setUser(userNameInput.value);
    joinScreen.style.display = "none";
    chatBoxScreen.style.display = "block";

    /* set room */
    if (roomNameInput.value) {
      socket.emit("create_room", { roomName: roomNameInput.value });
      sessionStorage.setRoom(roomNameInput.value);
      cardTitle.textContent = `CHAT ROOM NAME :  ${sessionStorage.getRoom()} || User :  ${sessionStorage.getUser()}`;
    }
    /* fire join user event */
    socket.emit("join_room", {
      user: userNameInput.value,
      roomName: sessionStorage.getRoom(),
    });
  }
  return false;
});

messageInput.addEventListener("keydown", function (event) {
  if (event.key == "Enter" && this.value != "") {
    func.sendMessage(messageInput);
  }
});

sendMessageBtn.addEventListener("click", function () {
  if (messageInput.value != "") {
    func.sendMessage(messageInput);
  }
});

/* ---------------------------------------------------------- */
/*                 SOCKET LISTENER EVENT                      */
/* ---------------------------------------------------------- */
socket.on("join_room", (data) => {
  func.addInfoMessageHTML(data, chatHistoryBox);
});

socket.on("chat_message", (data) => {
  func.addMessageHTML(data, chatHistoryBox);
});
