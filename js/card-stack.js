// Card Stack Manager
const cardStackModal = document.getElementById("cardStackModal");
const cardStackOverlay = document.getElementById("cardStackOverlay");
const cardStackContainer = document.getElementById("cardStackContainer");
const cardStackClose = document.getElementById("cardStackClose");
const cardCounter = document.getElementById("cardCounter");
const cardPrev = document.getElementById("cardPrev");
const cardNext = document.getElementById("cardNext");

let currentCardIndex = 0;
let cardsData = [];

// Light colors for card backgrounds (not dark)
const lightColors = [
  "#FFE5E5", // Light pink
  "#FFF4E5", // Light peach
  "#FFFBE5", // Light yellow
  "#E5FFE5", // Light green
  "#E5F5FF", // Light blue
  "#F0E5FF", // Light purple
  "#FFE5F5", // Light rose
  "#E5FFFF", // Light cyan
];

function getRandomLightColor() {
  return lightColors[Math.floor(Math.random() * lightColors.length)];
}

function openCardStack(todos, selectedDate) {
  if (!todos || todos.length === 0) {
    // No todos for this date, open create modal
    openCreateTodoModal(selectedDate);
    return;
  }

  cardsData = todos;
  currentCardIndex = 0;

  renderCards();
  updateCardCounter();
  cardStackModal.classList.add("active");
}

function renderCards() {
  // Clear existing cards (except nav buttons and counter)
  const existingCards = cardStackContainer.querySelectorAll(".todo-card");
  existingCards.forEach((card) => card.remove());

  cardsData.forEach((todo, index) => {
    const card = createCard(todo, index);
    cardStackContainer.insertBefore(card, cardStackContainer.firstChild);
  });

  updateCardPositions();
}

function createCard(todo, index) {
  const card = document.createElement("div");
  card.classList.add("todo-card");
  card.dataset.index = index;

  const bgColor = getRandomLightColor();
  const glowColor = bgColor.replace(")", ", 0.6)").replace("rgb", "rgba");

  card.innerHTML = `
    <div class="card-left">
      <h2>📝 Todo Details</h2>
      <div class="card-todo-text">${todo.text}</div>
      <div class="card-todo-datetime">
        📅 ${formatDate(todo.date)}
        ${todo.time ? `⏰ ${todo.time}` : ""}
      </div>
      <div class="card-actions">
        <button class="edit-card-btn" onclick="editCardTodo(${index})">✏️ Edit</button>
        <button class="delete-card-btn" onclick="deleteCardTodo(${index})">🗑️ Delete</button>
      </div>
    </div>
    
    <div class="card-separator"></div>
    
    <div class="card-right" style="background: ${bgColor};">
      <span class="card-star ${
        todo.starred ? "starred" : ""
      }" onclick="toggleCardStar(${index})">
        ${todo.starred ? "★" : "☆"}
      </span>
      
      <div class="card-info-box">
        <strong>STATUS</strong>
        ${todo.completed ? "✅ Completed" : "⏳ Pending"}
      </div>
      
      <div class="card-info-box">
        <strong>PRIORITY</strong>
        ${todo.priority || "Normal"}
      </div>
      
      <div class="card-info-box">
        <strong>CREATED</strong>
        ${formatDate(todo.createdAt)}
      </div>
    </div>
  `;

  card.style.setProperty("--glow-color", glowColor);

  return card;
}

function updateCardPositions() {
  const cards = cardStackContainer.querySelectorAll(".todo-card");

  cards.forEach((card, index) => {
    card.classList.remove("front", "back-1", "back-2", "back-3", "hidden");

    const position = index - currentCardIndex;

    if (position === 0) {
      card.classList.add("front");
    } else if (position === 1) {
      card.classList.add("back-1");
    } else if (position === 2) {
      card.classList.add("back-2");
    } else if (position === 3) {
      card.classList.add("back-3");
    } else {
      card.classList.add("hidden");
    }
  });
}

function updateCardCounter() {
  cardCounter.textContent = `${currentCardIndex + 1} / ${cardsData.length}`;
}

function nextCard() {
  if (currentCardIndex < cardsData.length - 1) {
    currentCardIndex++;
    updateCardPositions();
    updateCardCounter();
  }
}

function prevCard() {
  if (currentCardIndex > 0) {
    currentCardIndex--;
    updateCardPositions();
    updateCardCounter();
  }
}

function closeCardStack() {
  cardStackModal.classList.remove("active");
  cardsData = [];
  currentCardIndex = 0;
}

function formatDate(date) {
  if (!date) return "No date";
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// Global functions for card actions
window.editCardTodo = function (index) {
  const todo = cardsData[index];
  console.log("Editing todo:", todo);
  // This will open the edit modal
  closeCardStack();
  openEditTodoModal(todo);
};

window.deleteCardTodo = function (index) {
  if (confirm("Delete this todo?")) {
    const todo = cardsData[index];
    console.log("Deleting todo:", todo);

    // Remove from main todos array
    const mainIndex = todos.findIndex((t) => t.id === todo.id);
    if (mainIndex !== -1) {
      todos.splice(mainIndex, 1);
      if (typeof storage !== "undefined") {
        storage.saveTodos(todos);
      }
    }

    // Remove from cards
    cardsData.splice(index, 1);

    if (cardsData.length === 0) {
      closeCardStack();
      displayTodos();
    } else {
      if (currentCardIndex >= cardsData.length) {
        currentCardIndex = cardsData.length - 1;
      }
      renderCards();
      displayTodos();
    }
  }
};

window.toggleCardStar = function (index) {
  const todo = cardsData[index];
  todo.starred = !todo.starred;

  // Update in main todos array
  const mainIndex = todos.findIndex((t) => t.id === todo.id);
  if (mainIndex !== -1) {
    todos[mainIndex].starred = todo.starred;
    if (typeof storage !== "undefined") {
      storage.saveTodos(todos);
    }
  }

  renderCards();
  displayTodos();
};

// Event listeners
cardStackClose.addEventListener("click", closeCardStack);
cardStackOverlay.addEventListener("click", closeCardStack);
cardNext.addEventListener("click", nextCard);
cardPrev.addEventListener("click", prevCard);

// Keyboard navigation
document.addEventListener("keydown", function (e) {
  if (!cardStackModal.classList.contains("active")) return;

  if (e.key === "ArrowRight" || e.key === "ArrowDown") {
    nextCard();
  } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
    prevCard();
  } else if (e.key === "Escape") {
    closeCardStack();
  }
});

// Mouse wheel navigation
cardStackContainer.addEventListener("wheel", function (e) {
  e.preventDefault();
  if (e.deltaY > 0) {
    nextCard();
  } else {
    prevCard();
  }
});
