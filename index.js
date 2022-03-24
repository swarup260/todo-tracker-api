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
const SOCKETS = require("./api/controllers/SocketEvent.controller");
/* socket methods */
SOCKETS.init(http);
/* Test Routes */
app.get(
  "/",
  async (_request, response) =>
    await response.status(200).json({
      status: true,
      message: "todo projects!",
    })
);

/* Run the Express */
http.listen(config.PORT, () =>
  console.log(`Server Running At PORT ${config.PORT} `)
);

/* Mongoose Setting */
mongoose.connect(
  config.MONGODB_URI,
  {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  },
  (error, _db) => {
    if (error) throw error;
    console.log(`MongoDB Running At PORT ${config.MONGODB_PORT} `);
  }
);

mongoose.Promise = global.Promise;
