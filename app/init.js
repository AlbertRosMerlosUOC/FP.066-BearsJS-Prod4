const { ApolloServer } = require("@apollo/server");
const { ApolloServerPluginDrainHttpServer } = require('@apollo/server/plugin/drainHttpServer');
const { makeExecutableSchema } = require("@graphql-tools/schema");
const { expressMiddleware } = require('@apollo/server/express4');

const express = require("express");
const http = require("http");
const cors = require("cors");

const { MongoClient, ObjectId } = require("mongodb");
const { database } = require("./config/database");

const typeDefs = require("./graphql/typeDefs");
const resolvers = require("./resolvers/resolvers");
const HOST = "localhost";
const PORT = 3000;

// Necesario para la carga de archivos
const multer = require("multer");
var diskStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "app/data/upload");
  },
  filename: function (req, file, cb) {
    const pre = Date.now() + "-" + Math.round(Math.random() * 1e4);
    cb(null, pre + "-" + file.originalname);
  },
});
var upload = multer({ storage: diskStorage });

const app = express();
app.use(express.static("build"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const httpServer = http.createServer(app);

const { Server } = require("socket.io");
const io = new Server(httpServer);

io.on("connection", (socket) => {
  // Albert: Podemos comprobar si un cliente se conecta descomentando la siguiente línea
  // console.log('Un cliente se ha conectado');

  // Recolector de eventos que emiten mensajes
  socket.on("createWeek", (msg) => {
    console.log(msg);
    io.emit("showToast", msg);
  });

  socket.on("deleteWeek", (msg) => {
    console.log(msg);
    io.emit("showToast", msg);
  });

  socket.on("createTask", (msg) => {
    console.log(msg);
    io.emit("showToast", msg);
  });

  socket.on("updateTaskDay", (msg) => {
    console.log(msg);
    io.emit("showToast", msg);
  });

  socket.on("updateTask", (msg) => {
    console.log(msg);
    io.emit("showToast", msg);
  });

  socket.on("deleteTask", (msg) => {
    console.log(msg);
    io.emit("showToast", msg);
  });

  socket.on("importFile", (msg) => {
    console.log(msg);
    io.emit("fileToast", msg);
  });
});

// Configuración de CORS
app.use(
  cors({
    origin: "http://localhost:3000",
  })
);

app.use("/", express.static(__dirname + "/front"));

app.post("/upload", upload.single("myFile"), (req, res, next) => {
  const file = req.file;
  if (!file) {
    const error = new Error("Please upload a file");
    error.httpStatusCode = 400;
    return next(error);
  }
  res.send(file);
});

const schema = makeExecutableSchema({ typeDefs, resolvers });

// Inicio del servidor Apollo
const apolloServer = new ApolloServer({
  schema,
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
});

async function startApolloServer() {
  await apolloServer.start();
  // apolloServer.applyMiddleware({ app });
}

startApolloServer().then();



// Arranque de los servidores
httpServer.listen(PORT, HOST, () => {
  console.log(`Servidor Web en funcionamiento en http://${HOST}:${PORT}`);
  console.log(`Servidor Socket.io en funcionamiento en el puerto ${PORT}`);
});
