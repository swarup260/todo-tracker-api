import {
  addMessageHTML,
  addInfoMessageHTML
} from "./helpers";
import {
  getUser,
  getRoom,
  setUser,
  setRoom
} from "./sessionStorage";

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
  /* set user  */
  if (userNameInput.value != "") {
    setUser(userNameInput.value);
    joinScreen.style.display = "none";
    chatBoxScreen.style.display = "block";
    
    /* set room */
    let defaultChatRoom = roomNameInput.value || "public chat";
    socket.emit("create_room", {
      roomName: defaultChatRoom
    });
    setRoom(defaultChatRoom);
    cardTitle.textContent = `CHAT ROOM NAME :  ${getRoom()} || User :  ${getUser()}`;
    /* fire join user event */
    socket.emit("join_room", {
      user: userNameInput.value,
      roomName: getRoom(),
    });
  }
  return false;
});

messageInput.addEventListener("keydown", function (event) {
  if (event.key == "Enter" && this.value != "") {
    sendMessage(messageInput);
  }
});

sendMessageBtn.addEventListener("click", function () {
  if (messageInput.value != "") {
    sendMessage(messageInput);
  }
});


function sendMessage(selector) {
  socket.emit("chat_message", {
    message: selector.value,
    user: getUser(),
    roomName: getRoom(),
  });
  selector.value = "";
}

/* ---------------------------------------------------------- */
/*                 SOCKET LISTENER EVENT                      */
/* ---------------------------------------------------------- */
socket.on("join_room", (data) => {
  addInfoMessageHTML(data, chatHistoryBox);
});

socket.on("chat_message", (data) => {
  addMessageHTML(data, chatHistoryBox);
  chatHistoryBox.scrollTo = chatHistoryBox.clientHeight;
});