// storage.js - Handles saving and loading TODOs
const Store = require("electron-store");

// Create storage with default values
const store = new Store({
  name: "todos",
  defaults: {
    todos: [],
  },
});

// Storage functions
const storage = {
  // Get all TODOs
  getTodos: function () {
    return store.get("todos", []);
  },

  // Save all TODOs
  saveTodos: function (todos) {
    store.set("todos", todos);
    console.log("✅ TODOs saved to disk!");
  },

  // Clear all TODOs
  clearAll: function () {
    this.saveTodos([]);
    console.log("🗑️ All TODOs deleted!");
  },
};

module.exports = storage;
