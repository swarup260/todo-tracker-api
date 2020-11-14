/* ---------------------------------------------------------- */
/*             HELPERS METHOD                                 */
/* ---------------------------------------------------------- */
import { getUser } from "./sessionStorage";



function addMessageHTML(data, selector) {
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
  //   chatHistoryBox.appendChild(li);
  selector.appendChild(li);
}

function addInfoMessageHTML(data, selector) {
  let li = document.createElement("li");
  li.textContent = data.message;
  li.className = "chat-message align-center";
  //   chatHistoryBox.appendChild(li);
  selector.appendChild(li);
}

export { addMessageHTML, addInfoMessageHTML };
