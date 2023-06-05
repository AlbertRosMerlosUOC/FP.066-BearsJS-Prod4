import { pubsub } from '../config/pubsub.mjs';

// Importar los controladores
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

// Crear el objeto resolvers
export const resolvers = {
  Query: {
    // Resolver para obtener todas las semanas
    getWeeks: getWeeks,
    // Resolver para obtener una semana por _id
    getWeekById: getWeekById,
    // Resolver para obtener todas las tareas
    getTasks: getTasks,
    // Resolver para obtener una tarea por _id
    getTaskById: getTaskById,
    // Resolver para obtener todas las tareas por un _id de una semana
    getTasksByWeek: getTasksByWeek,
  },
  Mutation: {
    // Resolver para crear una semana
    createWeek: createWeek,
    // Resolver para actualizar una semana por _id. No lo vamos a utilizar en este producto.
    updateWeek: updateWeek,
    // Resolver para eliminar una semana por _id
    deleteWeek: deleteWeek,
    // Resolver para crear una tarea
    createTask: createTask,
    // Resolver para actualizar una tarea por _id
    updateTask: updateTask,
    // Resolver para actualizar el día asignado para una tarea por _id
    updateTaskDay: updateTaskDay,
    // Resolver para eliminar una tarea por _id
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
    // Subscription al mover una tarea
    movedTask: {
      subscribe: () => pubsub.asyncIterator(['MOVE_TASK']),
    },
    // Subscription al modificar una tarea
    addedTask: {
      subscribe: () => pubsub.asyncIterator(['ADD_TASK']),
    },
    // Subscription al modificar una tarea
    updatedTask: {
      subscribe: () => pubsub.asyncIterator(['EDIT_TASK']),
    },
    // Subscription al modificar una tarea
    deletedTask: {
      subscribe: () => pubsub.asyncIterator(['DELETE_TASK']),
    },
  },
};
