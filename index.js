/* Include Dependencies */
const Express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const config = require("./api/config");
const cors = require("cors");
/* Express App */
const app = Express();

/* Middlewares */
app.use(bodyParser.json());
app.use(cors());

/* Routers */

const userRoutes = require("./api/routes/User.routes");
const todoRoutes = require("./api/routes/Todo.routes");
const projectRoutes = require("./api/routes/Projects.routes");
const habitRoutes = require("./api/routes/Habit.routes");

app.use("/users", userRoutes);
app.use("/todos", todoRoutes);
app.use("/projects", projectRoutes);
app.use("/habit", habitRoutes);

/* Socket.io */
const http = require("http").createServer(app);
const io = require("socket.io")(http);

/* socket methods */

io.on("connection", async (socket) => {
  console.log("User Connection");
  socket.emit("connected", "You Are Online");
  socket.on("chat_message", async (data) => {
    // console.log(data);
    socket.broadcast.emit("chat_message", data);
  });
});

/* Test Routes */
app.get(
  "/",
  async (request, response) =>
    await response
    .status(200)
    .json({
      status: true,
      message: "Express Working"
    })
);

/* Run the Express */
http.listen(config.PORT, () =>
  console.log(`Server Running At PORT ${config.PORT} `)
);

/* Mongoose Setting */
mongoose.connect(
  config.MONGODB_URI, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  },
  (error, db) => {
    if (error) throw error;
    console.log(`MongoDB Running At PORT ${config.MONGODB_PORT} `);
  }
);

mongoose.Promise = global.Promise;