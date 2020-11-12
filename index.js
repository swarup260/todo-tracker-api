// import io from "socket.io-client";

const BASE_URL = "http://localhost:3000";

const socket = io(BASE_URL);

/* localStorage */
const setUser = (name) => sessionStorage.setItem("username", name);
const getUser = () => sessionStorage.getItem("username");

const setRoom = (roomName) => sessionStorage.setItem("roomName", roomName);
const getRoom = () => sessionStorage.getItem("roomName");

/* selectors */
const joinScreen = document.querySelector("#joinScreen");
const chatBoxScreen = document.querySelector("#chatBoxScreen");
const joinChatBtn = document.querySelector("#joinChat");
const userNameInput = document.querySelector("#userName");
const roomNameInput = document.querySelector("#roomName");

const chatHistoryBox = document.querySelector("#chatHistory");
const messageInput = document.querySelector("#message");
const sendMessageBtn = document.querySelector("#sendMessage");
const cardTitle = document.querySelector("span#chatBoxTitle");

joinChatBtn.addEventListener("click", function () {
  if (userNameInput.value != "") {
    setUser(userNameInput.value);
    joinScreen.style.display = "none";
    chatBoxScreen.style.display = "block";
    if (roomNameInput.value) {
      socket.emit("create_room", {roomName : roomNameInput.value});
      setRoom(roomNameInput.value);
      cardTitle.textContent = `CHAT ROOM NAME :  ${roomNameInput.value}`
    }
    socket.emit("join_room", {
      user : userNameInput.value,
      roomName: roomNameInput.value,
    });
  }
  return false;
});

/* Messaging Methods */
messageInput.addEventListener("keydown", function (event) {
  if (event.key == "Enter" && this.value != "") {
    sendMessage(messageInput);
  }
});

sendMessageBtn.addEventListener("click", function (event) {
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

function addMessageHTML(data) {
  let li = document.createElement("li");
  li.innerHTML = `
  <span class="message-sub-title" >${data.user}</span>
  <span class="message-title" >${data.message}</span>
  <span class="message-sub-title">${data.time}</span>
  `;
  li.className =
    data.user == getUser()
      ? "chat-message align-right"
      : "chat-message align-left";
  chatHistoryBox.appendChild(li);
}
function addInfoMessageHTML(data) {
  let li = document.createElement("li");
  li.textContent = data.message;
  li.className = "chat-message align-center";
  chatHistoryBox.appendChild(li);
}

/* socket event */
socket.on("connected", (data) => {
  cardTitle.textContent = data;
});

// socket.on("disconnect", (data) => {
//   cardTitle.textContent = data;
// });

socket.on("chat_message", (data) => {
  addMessageHTML(data);
});
socket.on("join_room", (data) => {
  addInfoMessageHTML(data);
});
