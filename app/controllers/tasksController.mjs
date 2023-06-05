import Task from "../models/Task.mjs";
import { pubsub } from "../config/pubsub.mjs";

export const getTasks = async () => {
  return await Task.find().populate("_id_week");
};

export const getTaskById = (root, args) => {
  return Task.findById(args._id).populate("_id_week").exec();
};

export const getTasksByWeek = async (_, { _id_week }) => {
  const tasks = await Task.find({ _id_week: _id_week }).populate("_id_week");
  return tasks;
};

export const createTask = async (
  _,
  {
    _id_week,
    name,
    description,
    hour_ini,
    hour_end,
    type,
    user,
    in_day,
    finished,
  }
) => {
  const newTask = new Task({
    _id_week,
    name,
    description,
    hour_ini,
    hour_end,
    type,
    user,
    in_day,
    finished,
  });
  let estado = "success";
  let mensaje = "Un usuario ha creado una nueva tarea con nombre '<i>" + name + "</i>'. Actualice la página para ver los cambios.";
  pubsub.publish("ADD_TASK", { addedTask: { estado, mensaje } });
  return await newTask.save();
};

export const updateTask = async (
  _,
  { _id, name, description, hour_ini, hour_end, type, user, in_day, finished }
) => {
  const updatedTask = await Task.findByIdAndUpdate(
    _id,
    {
      name,
      description,
      hour_ini,
      hour_end,
      type,
      user,
      in_day,
      finished,
    },
    { new: true }
  ).exec();
  let estado = "success";
  let mensaje = "Un usuario realizado modificaciones en la tarea '<i>" + name + "</i>'. Actualice la página para ver los cambios.";
  pubsub.publish("EDIT_TASK", { updatedTask: { estado, mensaje } });
  return updatedTask;
};

export const updateTaskDay = async (root, args) => {
  const task = await Task.findById(args._id).exec();
  task.in_day = args.in_day || task.in_day;
  const updatedTask = await task.save().then(() => {
    let estado = "success";
    let mensaje = "Un usuario ha movido la tarea '<i>" + task.name + "</i>' a otro día de la semana. Actualice la página para ver los cambios.";
    pubsub.publish("MOVE_TASK", { movedTask: { estado, mensaje } });
  });
  return updatedTask;
};

export const deleteTask = async (_, { _id }) => {
  const deletedTask = await Task.findByIdAndDelete(_id)
    .populate("_id_week")
    .exec();
    let estado = "success";
    let mensaje = "Un usuario ha eliminado la tarea '<i>" + deletedTask.name + "</i>'. Actualice la página para ver los cambios.";
    pubsub.publish("DELETE_TASK", { deletedTask: { estado, mensaje } });
  return deletedTask;
};
