document.addEventListener("DOMContentLoaded", function () {
  console.log("🚀 App starting...");
  // ===== LISTEN FOR CALENDAR IFRAME MESSAGES =====
  window.addEventListener("message", function (event) {
    // Security check (optional but recommended)
    // if (event.origin !== window.location.origin) return;

    if (event.data.type === "openTodoModal") {
      const clickedDate = new Date(event.data.date);

      // Open modal with selected date
      todoModal.classList.add("active");
      todoInput.value = "";
      selectedDate = clickedDate;
      currentDate = new Date(clickedDate);
      timeEnabled = false;
      timePicker.classList.remove("active");
      timeToggleBtn.classList.remove("active");
      timeToggleBtn.textContent = "⏰ Set Time (Optional)";
      hideError();

      setTimeout(() => {
        todoInput.focus();
        renderCalendar();
        updateDisplayDateTime();
      }, 100);
    }
  });
  // ===== SIDEBAR TOGGLE =====
  const toggleButton = document.getElementById("sidebarToggle");
  const mainContent = document.getElementById("mainContent");
  let sidebarVisible = true;

  function toggleSidebar() {
    const sidebar = document.getElementById("sidebar");
    const windowWidth = window.innerWidth;

    if (windowWidth <= 600) {
      // Phone mode: Toggle sidebar overlay
      sidebar.classList.toggle("active");
    } else {
      // Desktop mode: Show/hide normally
      sidebarVisible = !sidebarVisible;
      if (sidebarVisible) {
        mainContent.classList.remove("sidebar-hidden");
      } else {
        mainContent.classList.add("sidebar-hidden");
      }
    }
  }

  toggleButton.addEventListener("click", toggleSidebar);

  // Close sidebar when clicking outside (phone mode only)
  mainContent.addEventListener("click", function (e) {
    const sidebar = document.getElementById("sidebar");
    const windowWidth = window.innerWidth;

    if (windowWidth <= 600 && sidebar.classList.contains("active")) {
      if (!sidebar.contains(e.target) && !toggleButton.contains(e.target)) {
        sidebar.classList.remove("active");
      }
    }
  });

  // ===== PANEL NAVIGATION =====
  const sidebarItems = document.querySelectorAll(".sidebar ul li");
  const panels = document.querySelectorAll(".panel");

  sidebarItems.forEach((item) => {
    item.addEventListener("click", function () {
      const panelName = this.getAttribute("data-panel");

      // Remove active class from all items
      sidebarItems.forEach((i) => i.classList.remove("active"));

      // Add active class to clicked item
      this.classList.add("active");

      // Hide all panels
      panels.forEach((p) => p.classList.remove("active"));

      // Show selected panel
      const targetPanel = document.getElementById(`${panelName}-panel`);
      if (targetPanel) {
        targetPanel.classList.add("active");

        // Refresh important panel when opened
        if (panelName === "important") {
          displayImportantTodos();
        }
      }
    });
  });

  // ===== MODAL ELEMENTS =====
  const addTodoBtn = document.getElementById("addTodoBtn");
  const todoModal = document.getElementById("todoModal");
  const modalOverlay = document.getElementById("modalOverlay");
  const modalContent = document.getElementById("modalContent");
  const cancelBtn = document.getElementById("cancelBtn");
  const saveBtn = document.getElementById("saveBtn");
  const todayBtn = document.getElementById("todayBtn");
  const timeToggleBtn = document.getElementById("timeToggleBtn");
  const timePicker = document.getElementById("timePicker");
  const aiBtn = document.getElementById("aiBtn");
  const todoSubject = document.getElementById("todoSubject");

  const todoInput = document.getElementById("todoInput");
  const displayDateTime = document.getElementById("displayDateTime");
  const errorBubble = document.getElementById("errorBubble");
  const errorText = document.getElementById("errorText");

  // ===== CALENDAR ELEMENTS (MINI CALENDAR IN MODAL) =====
  const calendarDates = document.getElementById("calendarDates");
  const calMonth = document.getElementById("calMonth");
  const calPrev = document.getElementById("calPrev");
  const calNext = document.getElementById("calNext");
  const hourInput = document.getElementById("hourInput");
  const minuteInput = document.getElementById("minuteInput");
  const timeHelper = document.getElementById("timeHelper");

  // ===== STATE =====
  let currentDate = new Date();
  let selectedDate = new Date();
  let timeEnabled = false;

  // ===== ERROR HANDLING =====
  function showError(message) {
    errorText.textContent = message;
    errorBubble.classList.add("show");
    modalContent.classList.add("error");
    setTimeout(() => hideError(), 5000);
  }

  function hideError() {
    errorBubble.classList.remove("show");
    modalContent.classList.remove("error");
  }

  // ===== MINI CALENDAR FUNCTIONS (IN MODAL) =====
  function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    calMonth.textContent = `${monthNames[month]} ${year}`;

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    calendarDates.innerHTML = "";

    for (let i = firstDay - 1; i >= 0; i--) {
      const btn = document.createElement("button");
      btn.textContent = daysInPrevMonth - i;
      btn.classList.add("other-month");
      calendarDates.appendChild(btn);
    }

    const today = new Date();
    for (let day = 1; day <= daysInMonth; day++) {
      const btn = document.createElement("button");
      btn.textContent = day;

      if (
        year === today.getFullYear() &&
        month === today.getMonth() &&
        day === today.getDate()
      ) {
        btn.classList.add("today");
      }

      if (
        selectedDate &&
        year === selectedDate.getFullYear() &&
        month === selectedDate.getMonth() &&
        day === selectedDate.getDate()
      ) {
        btn.classList.add("selected");
      }

      btn.addEventListener("click", function () {
        selectDate(year, month, day);
      });

      calendarDates.appendChild(btn);
    }

    const totalCells = calendarDates.children.length;
    const remainingCells = 42 - totalCells;
    for (let i = 1; i <= remainingCells; i++) {
      const btn = document.createElement("button");
      btn.textContent = i;
      btn.classList.add("other-month");
      calendarDates.appendChild(btn);
    }
  }

  function selectDate(year, month, day) {
    selectedDate = new Date(year, month, day);
    renderCalendar();
    updateDisplayDateTime();
  }

  function calculateScheduledDate() {
    if (!selectedDate) return null;

    if (!timeEnabled) {
      const dateOnly = new Date(selectedDate);
      dateOnly.setHours(0, 0, 0, 0);
      return dateOnly;
    }

    const hours = parseInt(hourInput.value) || 0;
    const minutes = parseInt(minuteInput.value) || 0;

    const scheduledDate = new Date(selectedDate);
    scheduledDate.setHours(0, 0, 0, 0);
    scheduledDate.setHours(scheduledDate.getHours() + hours);
    scheduledDate.setMinutes(scheduledDate.getMinutes() + minutes);

    return scheduledDate;
  }

  function isDateInPast() {
    if (!selectedDate) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const selected = new Date(selectedDate);
    selected.setHours(0, 0, 0, 0);

    return selected < today;
  }

  function isScheduledInPast() {
    if (isDateInPast()) {
      return true;
    }

    if (!timeEnabled) return false;

    const scheduledDate = calculateScheduledDate();
    if (!scheduledDate) return false;

    const now = new Date();
    return scheduledDate < now;
  }

  function updateDisplayDateTime() {
    const scheduledDate = calculateScheduledDate();
    if (!scheduledDate) {
      displayDateTime.textContent = "Not set";
      displayDateTime.style.color = "#333";
      hideError();
      return;
    }

    const dateStr = scheduledDate.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });

    if (isDateInPast()) {
      if (timeEnabled) {
        const hours = scheduledDate.getHours();
        const minutes = scheduledDate.getMinutes();
        const timeStr = `${String(hours).padStart(2, "0")}:${String(
          minutes
        ).padStart(2, "0")}`;
        displayDateTime.textContent = `${dateStr} at ${timeStr} ❌`;
      } else {
        displayDateTime.textContent = `${dateStr} ❌`;
      }
      displayDateTime.style.color = "#ff5f56";
      showError(
        "This date is in the past! Please select today or a future date."
      );
      return;
    }

    if (timeEnabled) {
      const hours = scheduledDate.getHours();
      const minutes = scheduledDate.getMinutes();
      const timeStr = `${String(hours).padStart(2, "0")}:${String(
        minutes
      ).padStart(2, "0")}`;

      const now = new Date();
      if (scheduledDate < now) {
        displayDateTime.textContent = `${dateStr} at ${timeStr} ❌`;
        displayDateTime.style.color = "#ff5f56";
        showError("This time is in the past! Please select a future time.");
      } else {
        displayDateTime.textContent = `${dateStr} at ${timeStr}`;
        displayDateTime.style.color = "#333";
        hideError();
      }
    } else {
      displayDateTime.textContent = dateStr;
      displayDateTime.style.color = "#333";
      hideError();
    }
  }

  // ===== TIME TOGGLE =====
  timeToggleBtn.addEventListener("click", function () {
    timeEnabled = !timeEnabled;

    if (timeEnabled) {
      timePicker.classList.add("active");
      timeToggleBtn.classList.add("active");
      timeToggleBtn.textContent = "⏰ Time Enabled";

      const now = new Date();
      const futureHour = now.getHours() + 1;
      hourInput.value = futureHour;
      minuteInput.value = "00";
    } else {
      timePicker.classList.remove("active");
      timeToggleBtn.classList.remove("active");
      timeToggleBtn.textContent = "⏰ Set Time (Optional)";
    }

    updateDisplayDateTime();
  });

  // ===== TIME INPUT VALIDATION =====
  hourInput.addEventListener("input", function () {
    validateTimeInput();
    updateDisplayDateTime();
  });

  minuteInput.addEventListener("input", function () {
    validateTimeInput();
    updateDisplayDateTime();
  });

  function validateTimeInput() {
    let hours = parseInt(hourInput.value) || 0;
    let minutes = parseInt(minuteInput.value) || 0;

    if (hours < 0) {
      hourInput.value = 0;
      hours = 0;
    }
    if (hours > 999) {
      hourInput.value = 999;
      hours = 999;
    }

    if (minutes < 0) {
      minuteInput.value = 0;
      minutes = 0;
    }
    if (minutes > 59) {
      minuteInput.value = 59;
      minutes = 59;
    }

    if (hours >= 24) {
      const days = Math.floor(hours / 24);
      const remainingHours = hours % 24;
      timeHelper.textContent = `${days} day(s) and ${remainingHours} hour(s) from selected date`;
    } else if (hours === 0 && minutes === 0) {
      timeHelper.textContent = `At midnight of selected date`;
    } else {
      timeHelper.textContent = `${hours} hour(s) and ${minutes} minute(s) from selected date`;
    }
  }

  // ===== CALENDAR NAVIGATION =====
  calPrev.addEventListener("click", function () {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
  });

  calNext.addEventListener("click", function () {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
  });

  // ===== TODAY BUTTON =====
  todayBtn.addEventListener("click", function () {
    const today = new Date();
    currentDate = new Date(today);
    selectDate(today.getFullYear(), today.getMonth(), today.getDate());
  });

  // ===== MODAL OPEN =====
  addTodoBtn.addEventListener("click", function () {
    // Check if we're in important panel
    const importantPanel = document.getElementById("important-panel");
    const isImportantPanelActive =
      importantPanel && importantPanel.classList.contains("active");

    todoModal.classList.add("active");
    todoInput.value = "";
    selectedDate = new Date();
    currentDate = new Date();
    timeEnabled = false;
    timePicker.classList.remove("active");
    timeToggleBtn.classList.remove("active");
    timeToggleBtn.textContent = "⏰ Set Time (Optional)";
    hideError();

    // Store context
    window.currentTodoContext = {
      isImportant: isImportantPanelActive,
    };

    setTimeout(() => {
      todoInput.focus();
      renderCalendar();
      updateDisplayDateTime();
    }, 100);
  });

  // ===== MODAL CLOSE =====
  modalOverlay.addEventListener("click", function () {
    todoModal.classList.remove("active");
    hideError();
  });

  cancelBtn.addEventListener("click", function () {
    todoModal.classList.remove("active");
    hideError();
  });

  // ===== AI BUTTON =====
  aiBtn.addEventListener("click", function () {
    showError("AI Enhancement feature coming soon!");
  });

  // ===== TODO STORAGE =====
  const todoListContainer = document.querySelector(".todo-list");
  let todos = [];
  // ===== DETAIL PANEL FUNCTIONS =====
  function showTodoDetailPanel(todo) {
    let detailPanel = document.getElementById("todoDetailPanel");

    if (!detailPanel) {
      detailPanel = document.createElement("div");
      detailPanel.id = "todoDetailPanel";
      detailPanel.className = "todo-detail-panel";
      document.body.appendChild(detailPanel);
    }

    let html = `
      <div class="detail-panel-overlay" onclick="closeTodoDetailPanel()"></div>
      <div class="detail-panel-content">
        <button class="detail-panel-close" onclick="closeTodoDetailPanel()">✕</button>
        
        <div class="detail-panel-body">
          ${todo.subject ? `<h2>${todo.subject}</h2>` : ""}
          
          ${
            todo.date
              ? `
            <div class="detail-panel-datetime">
              <span>📅 ${new Date(todo.date).toLocaleDateString("en-US", {
                weekday: "short",
                year: "numeric",
                month: "short",
                day: "numeric",
              })}</span>
              ${todo.time ? `<span>⏰ ${todo.time}</span>` : ""}
            </div>
          `
              : ""
          }
          
          ${
            todo.text
              ? `
            <div class="detail-panel-text">
              <label>Details:</label>
              <p>${todo.text}</p>
            </div>
          `
              : ""
          }
        </div>
      </div>
    `;

    detailPanel.innerHTML = html;
    detailPanel.classList.add("active");
  }

  window.closeTodoDetailPanel = function () {
    const detailPanel = document.getElementById("todoDetailPanel");
    if (detailPanel) {
      detailPanel.classList.remove("active");
    }
  };

  function loadTodos() {
    try {
      if (typeof storage === "undefined") {
        console.error("❌ Storage not loaded!");
        return;
      }

      const savedTodos = storage.getTodos();
      console.log(`📂 Loaded ${savedTodos.length} TODOs`);

      todos = savedTodos.map((todo) => ({
        ...todo,
        date: todo.date ? new Date(todo.date) : null,
        createdAt: todo.createdAt ? new Date(todo.createdAt) : new Date(),
      }));

      displayTodos();
    } catch (error) {
      console.error("❌ Error loading:", error);
      todos = [];
    }
  }

  // ===== SAVE TODO =====
  // ===== SAVE TODO =====
  saveBtn.addEventListener("click", function () {
    const subject = todoSubject.value.trim();
    const todoText = todoInput.value.trim();

    // Validation: Need at least subject OR details
    if (subject === "" && todoText === "") {
      showError("Please write a subject or details!");
      todoSubject.focus();
      return;
    }

    if (isDateInPast()) {
      showError(
        "Cannot save TODO with a past date! Please select today or a future date."
      );
      return;
    }

    if (timeEnabled && isScheduledInPast()) {
      showError("Cannot save TODO in the past! Please select a future time.");
      return;
    }

    const scheduledDate = calculateScheduledDate();

    let scheduledTime = null;
    if (timeEnabled && scheduledDate) {
      const hours = scheduledDate.getHours();
      const minutes = scheduledDate.getMinutes();
      scheduledTime = `${String(hours).padStart(2, "0")}:${String(
        minutes
      ).padStart(2, "0")}`;
    }

    const todo = {
      id: Date.now() + Math.random(),
      subject: subject, // NEW
      text: todoText,
      date: scheduledDate,
      time: scheduledTime,
      completed: false,
      createdAt: new Date(),
      starred:
        window.currentTodoContext && window.currentTodoContext.isImportant,
    };

    console.log("📝 Creating TODO:", todo);

    todos.push(todo);

    try {
      if (typeof storage !== "undefined") {
        storage.saveTodos(todos);
        console.log("✅ Saved!");
      }
    } catch (error) {
      console.error("❌ Error:", error);
    }

    displayTodos();
    displayImportantTodos();
    todoModal.classList.remove("active");
    hideError();

    // Clear both fields
    todoSubject.value = "";
    todoInput.value = "";
  });

  // ===== DISPLAY TODOS =====
  function displayTodos() {
    console.log(`🎨 Displaying ${todos.length} TODOs`);

    const existingTodos = todoListContainer.querySelectorAll(".todo-item");
    existingTodos.forEach((item) => item.remove());

    if (todos.length === 0) {
      return;
    }

    todos.sort((a, b) => {
      if (!a.date) return 1;
      if (!b.date) return -1;
      return new Date(a.date) - new Date(b.date);
    });

    todos.forEach((todo) => {
      const todoItem = document.createElement("div");
      todoItem.classList.add("todo-item");
      if (todo.completed) {
        todoItem.classList.add("completed");
      }

      let dateTimeStr = "";
      if (todo.date) {
        const todoDate = new Date(todo.date);
        const now = new Date();
        const isPast = todo.time && todoDate < now;

        const dateStr = todoDate.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });

        if (todo.time) {
          const icon = isPast ? "⏰" : "📅";
          dateTimeStr = `<span class="todo-datetime">${icon} ${dateStr} • ${todo.time}</span>`;
        } else {
          dateTimeStr = `<span class="todo-datetime">📅 ${dateStr}</span>`;
        }
      }

      // Determine what text to display
      let displayText;
      if (todo.subject && todo.subject.trim() !== "") {
        displayText = todo.subject;
      } else if (todo.text) {
        displayText = todo.text.substring(0, 50);
        if (todo.text.length > 50) {
          displayText += "...";
        }
      } else {
        displayText = "Untitled Task";
      }

      todoItem.innerHTML = `
        <div class="todo-content">
          <input type="checkbox" class="todo-checkbox" ${
            todo.completed ? "checked" : ""
          }>
          <div class="todo-text">
            <p>${displayText}</p>
            ${dateTimeStr}
          </div>
        </div>
        <button class="todo-delete">🗑️</button>
      `;

      const checkbox = todoItem.querySelector(".todo-checkbox");
      checkbox.addEventListener("change", function (e) {
        e.stopPropagation();
        todo.completed = this.checked;
        todoItem.classList.toggle("completed", this.checked);

        if (typeof storage !== "undefined") {
          storage.saveTodos(todos);
        }
      });

      const deleteBtn = todoItem.querySelector(".todo-delete");
      deleteBtn.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();

        console.log(`🗑️ Deleting: ${todo.text}`);

        const index = todos.findIndex((t) => t.id === todo.id);
        if (index !== -1) {
          todos.splice(index, 1);

          if (typeof storage !== "undefined") {
            storage.saveTodos(todos);
          }

          displayTodos();
          displayImportantTodos();
        }
      });

      // NEW: Add click handler to show details
      todoItem.addEventListener("click", function (e) {
        if (
          e.target.classList.contains("todo-checkbox") ||
          e.target.classList.contains("todo-delete") ||
          e.target.closest(".todo-delete")
        ) {
          return;
        }
        showTodoDetailPanel(todo);
      });

      todoListContainer.appendChild(todoItem);
    });
  }

  // ===== DISPLAY IMPORTANT TODOS =====
  function displayImportantTodos() {
    const importantList = document.querySelector(".important-list");

    if (!importantList) return;

    const existingTodos = importantList.querySelectorAll(".todo-item");
    existingTodos.forEach((item) => item.remove());

    const starredTodos = todos.filter((todo) => todo.starred);

    if (starredTodos.length === 0) {
      return;
    }

    starredTodos.sort((a, b) => {
      if (!a.date) return 1;
      if (!b.date) return -1;
      return new Date(a.date) - new Date(b.date);
    });

    starredTodos.forEach((todo) => {
      const todoItem = document.createElement("div");
      todoItem.classList.add("todo-item");
      if (todo.completed) {
        todoItem.classList.add("completed");
      }

      let dateTimeStr = "";
      if (todo.date) {
        const todoDate = new Date(todo.date);
        const now = new Date();
        const isPast = todo.time && todoDate < now;

        const dateStr = todoDate.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });

        if (todo.time) {
          const icon = isPast ? "⏰" : "📅";
          dateTimeStr = `<span class="todo-datetime">${icon} ${dateStr} • ${todo.time}</span>`;
        } else {
          dateTimeStr = `<span class="todo-datetime">📅 ${dateStr}</span>`;
        }
      }

      todoItem.innerHTML = `
        <div class="todo-content">
          <input type="checkbox" class="todo-checkbox" ${
            todo.completed ? "checked" : ""
          }>
          <div class="todo-text">
            <p>⭐ ${todo.text}</p>
            ${dateTimeStr}
          </div>
        </div>
        <button class="todo-delete">🗑️</button>
      `;

      const checkbox = todoItem.querySelector(".todo-checkbox");
      checkbox.addEventListener("change", function (e) {
        e.stopPropagation();
        todo.completed = this.checked;
        todoItem.classList.toggle("completed", this.checked);

        if (typeof storage !== "undefined") {
          storage.saveTodos(todos);
        }
      });

      const deleteBtn = todoItem.querySelector(".todo-delete");
      deleteBtn.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();

        const index = todos.findIndex((t) => t.id === todo.id);
        if (index !== -1) {
          todos.splice(index, 1);

          if (typeof storage !== "undefined") {
            storage.saveTodos(todos);
          }

          displayTodos();
          displayImportantTodos();
        }
      });

      importantList.appendChild(todoItem);
    });
  }

  // ===== LOAD ON STARTUP =====
  setTimeout(loadTodos, 200);

  console.log("✅ App ready!");
});
