/* ---------------------------------------------------------- */
/*             SESSION STORAGE HELPERS METHOD                 */
/* ---------------------------------------------------------- */

const setUser = (name) => sessionStorage.setItem("username", name);
const getUser = () => sessionStorage.getItem("username");

const setRoom = (roomName) => sessionStorage.setItem("roomName", roomName);
const getRoom = () => sessionStorage.getItem("roomName");

export default {
  setUser,
  getUser,
  setRoom,
  getRoom,
};
