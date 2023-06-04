import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer'
import { makeExecutableSchema } from '@graphql-tools/schema';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';

import express from 'express';
import http from 'http';
import cors from 'cors';
import bodyParser from 'body-parser';
import { Server } from 'socket.io';

import "./database.mjs";
import { typeDefs } from '../graphql/typeDefs.mjs';

// TODO import { resolvers } from '../resolvers/resolvers.mjs';
import { 
  getWeeks,
  getWeekById,
  createWeek,
  updateWeek,
  deleteWeek, } from "../controllers/weeksController.mjs";

import {
  getTasks,
  getTaskById,
  getTasksByWeek,
  createTask,
  updateTask,
  updateTaskDay,
  deleteTask, } from "../controllers/tasksController.mjs";

const resolvers = {
    Query: {
      getWeeks: getWeeks,
      getWeekById: getWeekById,
      getTasks: getTasks,
      getTaskById: getTaskById,
      getTasksByWeek: getTasksByWeek,
    },
    Mutation: {
      createWeek: createWeek,
      updateWeek: updateWeek,
      deleteWeek: deleteWeek,
      createTask: createTask,
      updateTask: updateTask,
      updateTaskDay: updateTaskDay,
      deleteTask: deleteTask,
    },
    Subscription: {
      hello: {
        // Example using an async generator
        subscribe: async function* () {
          for await (const word of ["Hello", "Bonjour", "Ciao"]) {
            yield { hello: word };
          }
        },
      },
    },
  }

import { pubsub } from './pubsub.mjs';

const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer);

const schema = makeExecutableSchema({ typeDefs, resolvers });

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

const wsServer = new WebSocketServer({
  server: httpServer,
  path: '/graphql',
});

const serverCleanup = useServer({ schema }, wsServer);

app.use(
  '/graphql',
  cors(),
  bodyParser.json(),
  expressMiddleware(server),
);

app.use('/', express.static('app/front/'));

await new Promise((resolve) => httpServer.listen({ port: 3000 }, resolve));
console.log(`Servidor Web en funcionamiento en http://localhost:3000`);