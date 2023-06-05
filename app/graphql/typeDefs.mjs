import { gql } from 'apollo-server-express';

// export const typeDefs = `#graphql
export const typeDefs = gql`
  type Week {
    _id: ID!
    week: Int!
    year: Int!
    description: String
    type: String!
    hour_ini: String
    hour_end: String
    color: String
  }

  type Task {
    _id: ID!
    _id_week: Week!
    name: String!
    description: String!
    hour_ini: String
    hour_end: String
    type: String!
    user: String
    in_day: String
    finished: Boolean!
    file_name: String
  }

  type Query {
    getWeekById(_id: ID!): Week
    getWeeks: [Week]
    getTaskById(_id: ID!): Task
    getTasks: [Task]
    getTasksByWeek(_id_week: String!): [Task!]!
  }

  type Mutation {
    createWeek(
      week: Int!
      year: Int!
      description: String
      type: String!
      hour_ini: String
      hour_end: String
      color: String
    ): Week

    updateWeek(
      _id: ID!
      week: Int
      year: Int
      description: String
      type: String
      hour_ini: String
      hour_end: String
      color: String
    ): Week

    deleteWeek(_id: ID!): Week

    createTask(
      _id_week: ID!
      name: String!
      description: String!
      hour_ini: String
      hour_end: String
      type: String!
      user: String
      in_day: String
      finished: Boolean!
      file_name: String
    ): Task

    updateTask(
      _id: ID!
      name: String
      description: String
      hour_ini: String
      hour_end: String
      type: String
      user: String
      in_day: String
      finished: Boolean
    ): Task

    updateTaskDay(_id: ID!, in_day: String): Task

    updateTaskFile(_id: ID!, file_name: String): Task

    deleteTask(_id: ID!): Task
  }

  type Actividad {
    estado: String
    mensaje: String
  }

  type Subscription {
    hello: String
    movedTask: Actividad
    addedTask: Actividad
    updatedTask: Actividad
    deletedTask: Actividad
    uploadedFile: Actividad
  }
`