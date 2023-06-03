const { ApolloServer } = require("apollo-server");
// const { makeExecutableSchema } = require("graphql-tools");
const { makeExecutableSchema } = require("@graphql-tools/schema");
const { MongoClient, ObjectId } = require("mongodb");
const { database } = require("./config/database");
const typeDefs = require("./graphql/typeDefs");
const resolvers = require("./resolvers/resolvers");
const express = require("express");
const HOST = "localhost";
const PORT = 3000;
const ApolloServerPluginDrainHttpServer =
  require("apollo-server-core").ApolloServerPluginDrainHttpServer;

const bodyParser = require("body-parser");
//const expressMiddleware = require("graphql-voyager/middleware").express;

const { ApolloSandbox } = require("@apollo/sandbox");

const app = express();
app.use(express.static("build"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const cors = require("cors");
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

const httpServer = http.createServer(app);
const { WebSocketServer } = require("ws");
const { useServer } = require("graphql-ws/lib/use/ws");

// Necesario para las suscripciones
// const { execute, subscribe } = require("graphql");
// const { SubscriptionServer } = require("subscriptions-transport-ws");

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

app.post("/upload", upload.single("myFile"), (req, res, next) => {
  const file = req.file;
  if (!file) {
    const error = new Error("Please upload a file");
    error.httpStatusCode = 400;
    return next(error);
  }
  res.send(file);
});

const schema = new makeExecutableSchema({ typeDefs, resolvers });

// Inicio del servidor Apollo
const apolloServer = new ApolloServer({
  schema,
  plugins: [
    // Proper shutdown for the HTTP server.
    ApolloServerPluginDrainHttpServer({ httpServer }),

    // Proper shutdown for the WebSocket server.
    {
      async serverWillStart() {
        return {
          async drainServer() {
            await serverCleanup.dispose();
          },
        };
      },
    },
  ],
});

const wsServer = new WebSocketServer({
  server: httpServer,

  path: "/graphql",
});

const serverCleanup = useServer({ schema }, wsServer);

app.use("/graphql", cors(), bodyParser.json());

app.use("/", express.static(__dirname + "/front"));

// Arranque de los servidores
apolloServer.listen({ port: process.env.PORT || 5000 }).then(({ url }) => {
  console.log(`Servidor Apollo en funcionamiento en ${url}`);

  server.listen(PORT, HOST, () => {
    console.log(`Servidor Web en funcionamiento en http://${HOST}:${PORT}`);
    console.log(`Servidor Socket.io en funcionamiento en el puerto ${PORT}`);
  });
});
