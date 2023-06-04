import { ApolloServer } from '@apollo/server';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer'
import { expressMiddleware } from '@apollo/server/express4';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { Server } from 'socket.io';
import { useServer } from 'graphql-ws/lib/use/ws';
import { WebSocketServer } from 'ws';

import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import http from 'http';

import "./database.mjs";
import { resolvers } from '../resolvers/resolvers.mjs';
import { typeDefs } from '../graphql/typeDefs.mjs';

// TODO
// import { multer } from 'multer';
// var diskStorage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "app/data/upload");
//   },
//   filename: function (req, file, cb) {
//     const pre = Date.now() + "-" + Math.round(Math.random() * 1e4);
//     cb(null, pre + "-" + file.originalname);
//   },
// });
// var upload = multer({ storage: diskStorage });

const app = express();
      app.use(express.static("build"));
      app.use(express.json());
      app.use(express.urlencoded({ extended: true }));
const httpServer = http.createServer(app);

const io = new Server(httpServer);
io.on("connection", (socket) => {
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

const schema = makeExecutableSchema({ typeDefs, resolvers });

const wsServer = new WebSocketServer({
  server: httpServer,
  path: '/graphql',
});
const serverCleanup = useServer({ schema }, wsServer);

const server = new ApolloServer({
  schema,
  plugins: [
    ApolloServerPluginDrainHttpServer({ httpServer }),
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
await server.start();

app.use(
  '/graphql',
  cors(),
  bodyParser.json(),
  expressMiddleware(server),
);

app.use('/', express.static('app/front/'));

await new Promise((resolve) => httpServer.listen({ port: 3000 }, resolve));
console.log(`Servidor Web en funcionamiento en http://localhost:3000`);