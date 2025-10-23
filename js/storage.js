// storage.js - Simple file-based storage using Node.js fs
const fs = require("fs");
const path = require("path");
const { app } = require("electron").remote || require("@electron/remote");

// Get user data path
const userDataPath = app.getPath("userData");
const todosFilePath = path.join(userDataPath, "todos.json");

console.log("💾 Storage file location:", todosFilePath);

// Storage functions
const storage = {
  // Get all TODOs
  getTodos: function () {
    try {
      if (fs.existsSync(todosFilePath)) {
        const data = fs.readFileSync(todosFilePath, "utf8");
        return JSON.parse(data);
      }
      return [];
    } catch (error) {
      console.error("Error reading todos:", error);
      return [];
    }
  },

  // Save all TODOs
  saveTodos: function (todos) {
    try {
      fs.writeFileSync(todosFilePath, JSON.stringify(todos, null, 2), "utf8");
      console.log("✅ TODOs saved to disk!");
    } catch (error) {
      console.error("Error saving todos:", error);
    }
  },

  // Add a single TODO
  addTodo: function (todo) {
    const todos = this.getTodos();
    todos.push(todo);
    this.saveTodos(todos);
    console.log("➕ TODO added:", todo.text);
    return todo;
  },

  // Delete a single TODO by ID
  deleteTodo: function (todoId) {
    const todos = this.getTodos();
    const filteredTodos = todos.filter((todo) => todo.id !== todoId);
    this.saveTodos(filteredTodos);
    console.log("🗑️ TODO deleted:", todoId);
    return filteredTodos;
  },

  // Update a single TODO
  updateTodo: function (todoId, updates) {
    const todos = this.getTodos();
    const index = todos.findIndex((todo) => todo.id === todoId);

    if (index !== -1) {
      todos[index] = { ...todos[index], ...updates };
      this.saveTodos(todos);
      console.log("✏️ TODO updated:", todoId);
      return todos[index];
    }

    return null;
  },

  // Clear all TODOs
  clearAll: function () {
    this.saveTodos([]);
    console.log("🗑️ All TODOs deleted!");
  },
};

module.exports = storage;
