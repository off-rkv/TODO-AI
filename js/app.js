document.addEventListener("DOMContentLoaded", function () {
  console.log("🚀 App starting...");

  // ===== SIDEBAR TOGGLE =====
  const toggleButton = document.getElementById("sidebarToggle");
  const mainContent = document.getElementById("mainContent");
  let sidebarVisible = true;

  function toggleSidebar() {
    sidebarVisible = !sidebarVisible;
    if (sidebarVisible) {
      mainContent.classList.remove("sidebar-hidden");
    } else {
      mainContent.classList.add("sidebar-hidden");
    }
  }

  toggleButton.addEventListener("click", toggleSidebar);

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
  const todoInput = document.getElementById("todoInput");
  const displayDateTime = document.getElementById("displayDateTime");
  const errorBubble = document.getElementById("errorBubble");
  const errorText = document.getElementById("errorText");

  // ===== CALENDAR ELEMENTS =====
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

  // ===== CALENDAR FUNCTIONS =====
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

  // ✅ NEW: Check if date is in the past
  function isDateInPast() {
    if (!selectedDate) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const selected = new Date(selectedDate);
    selected.setHours(0, 0, 0, 0);

    return selected < today;
  }

  // ✅ UPDATED: Check if scheduled date/time is in past
  function isScheduledInPast() {
    // Check date first
    if (isDateInPast()) {
      return true;
    }

    // Check time (only if time enabled)
    if (!timeEnabled) return false;

    const scheduledDate = calculateScheduledDate();
    if (!scheduledDate) return false;

    const now = new Date();
    return scheduledDate < now;
  }

  // ✅ UPDATED: Display date/time with validation
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

    // ✅ Check if date is in the past
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

    // ✅ Show time only if enabled
    if (timeEnabled) {
      const hours = scheduledDate.getHours();
      const minutes = scheduledDate.getMinutes();
      const timeStr = `${String(hours).padStart(2, "0")}:${String(
        minutes
      ).padStart(2, "0")}`;

      // Check if time is in past (for today)
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
    todoModal.classList.add("active");
    todoInput.value = "";
    selectedDate = new Date();
    currentDate = new Date();
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
  saveBtn.addEventListener("click", function () {
    const todoText = todoInput.value.trim();

    if (todoText === "") {
      showError("Please write a TODO task!");
      todoInput.focus();
      return;
    }

    // ✅ UPDATED: Check if date is in past
    if (isDateInPast()) {
      showError(
        "Cannot save TODO with a past date! Please select today or a future date."
      );
      return;
    }

    // ✅ Check past time ONLY if time is enabled
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
      text: todoText,
      date: scheduledDate,
      time: scheduledTime,
      completed: false,
      createdAt: new Date(),
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
    todoModal.classList.remove("active");
    hideError();
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

      todoItem.innerHTML = `
        <div class="todo-content">
          <input type="checkbox" class="todo-checkbox" ${
            todo.completed ? "checked" : ""
          }>
          <div class="todo-text">
            <p>${todo.text}</p>
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
        }
      });

      todoListContainer.appendChild(todoItem);
    });
  }

  // ===== LOAD ON STARTUP =====
  setTimeout(loadTodos, 200);

  console.log("✅ App ready!");
});
