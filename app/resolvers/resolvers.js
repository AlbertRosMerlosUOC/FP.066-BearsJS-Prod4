// Importar los controladores
const weeksController = require("../controllers/weeksController");
const tasksController = require("../controllers/tasksController");
//const pubsub = require("../pubsub");

// Crear el objeto resolvers
const resolvers = {
  Query: {
    // Resolver para obtener todas las semanas
    getWeeks: weeksController.getWeeks,
    // Resolver para obtener una semana por _id
    getWeekById: weeksController.getWeekById,
    // Resolver para obtener todas las tareas
    getTasks: tasksController.getTasks,
    // Resolver para obtener una tarea por _id
    getTaskById: tasksController.getTaskById,
    // Resolver para obtener todas las tareas por un _id de una semana
    getTasksByWeek: tasksController.getTasksByWeek,
  },
  Mutation: {
    // Resolver para crear una semana
    createWeek: weeksController.createWeek,
    // Resolver para actualizar una semana por _id. No lo vamos a utilizar en este producto.
    updateWeek: weeksController.updateWeek,
    // Resolver para eliminar una semana por _id
    deleteWeek: weeksController.deleteWeek,
    // Resolver para crear una tarea
    createTask: tasksController.createTask,
    // Resolver para actualizar una tarea por _id
    updateTask: tasksController.updateTask,
    // Resolver para actualizar el día asignado para una tarea por _id
    updateTaskDay: tasksController.updateTaskDay,
    // Resolver para eliminar una tarea por _id
    deleteTask: tasksController.deleteTask,
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
    // Subscription para crear una semana
    newWeek: {
      subscribe: () => pubsub.asyncIterator(["NEW_WEEK"]),
    },
    // Subscription para crear una tarea
    newTask: {
      subscribe: () => pubsub.asyncIterator(["NEW_TASK"]),
    },
  },
};

// Exportar el objeto resolvers
module.exports = resolvers;
