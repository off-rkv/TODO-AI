document.addEventListener("DOMContentLoaded", function () {
  console.log("🚀 App starting...");

  // ===== RESIZE HANDLE FUNCTIONALITY =====
  const resizeHandle = document.getElementById("resizeHandle");
  const rightPanel = document.getElementById("rightPanel");
  const mainContent = document.getElementById("mainContent");
  let isResizing = false;
  let startX = 0;
  let startWidth = 0;
  let isStarred = false;

  resizeHandle.addEventListener("mousedown", function (e) {
    isResizing = true;
    startX = e.clientX;
    startWidth = rightPanel.offsetWidth;
    document.body.style.cursor = "col-resize";
    document.body.classList.add("resizing");
    e.preventDefault();
  });

  document.addEventListener("mousemove", function (e) {
    if (!isResizing) return;

    // Calculate how much mouse moved (LEFT = positive, RIGHT = negative)
    const deltaX = startX - e.clientX;

    // Calculate new width
    const newWidth = startWidth + deltaX;

    // Limit between 100px and 600px (allowing your calendar's 100px)
    if (newWidth >= 100 && newWidth <= 600) {
      const isSidebarHidden = mainContent.classList.contains("sidebar-hidden");

      if (isSidebarHidden) {
        mainContent.style.gridTemplateColumns = `0px 1fr 5px ${newWidth}px`;
      } else {
        mainContent.style.gridTemplateColumns = `200px 1fr 5px ${newWidth}px`;
      }
    }
  });

  document.addEventListener("mouseup", function () {
    if (isResizing) {
      isResizing = false;
      document.body.style.cursor = "default";
      document.body.classList.remove("resizing");

      // Save width for current active panel
      const currentWidth = rightPanel.offsetWidth;
      saveRightPanelWidth(currentActivePanel, currentWidth);

      console.log(`💾 Saved ${currentActivePanel} width: ${currentWidth}px`);
    }
  });

  // ===== PANEL WIDTH STORAGE =====
  function getPanelWidthKey(panelName) {
    return `rightPanelWidth_${panelName}`;
  }

  function saveRightPanelWidth(panelName, width) {
    localStorage.setItem(getPanelWidthKey(panelName), width);
    console.log(`💾 Saved ${panelName} right panel width: ${width}px`);
  }

  function loadRightPanelWidth(panelName) {
    const saved = localStorage.getItem(getPanelWidthKey(panelName));

    if (saved) {
      return parseInt(saved);
    }

    // ✅ SET CUSTOM DEFAULT WIDTH PER PANEL
    const defaultWidths = {
      home: 350, // Home panel default
      calendar: 250,
      important: 350, // Important panel default
      progress: 300, // Progress panel default
      crossnotify: 350,
      team: 350,
      profile: 350,
      setting: 350,
    };

    // Return custom default or fallback to 350px
    return defaultWidths[panelName] || 350;
  }

  function applyRightPanelWidth(panelName) {
    const width = loadRightPanelWidth(panelName);

    // ✅ Check if sidebar is visible
    const isSidebarHidden = mainContent.classList.contains("sidebar-hidden");

    if (isSidebarHidden) {
      // When sidebar is hidden, first column = 0px
      mainContent.style.gridTemplateColumns = `0px 1fr 5px ${width}px`;
    } else {
      // When sidebar is visible, first column = 200px
      mainContent.style.gridTemplateColumns = `200px 1fr 5px ${width}px`;
    }

    console.log(
      `📐 Applied ${panelName} width: ${width}px (sidebar hidden: ${isSidebarHidden})`
    );
  }

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

    // ===== INITIALIZE RIGHT PANEL STATE =====
    document.addEventListener("DOMContentLoaded", function () {
      // Start with empty state visible
      const rightPanelEmpty = document.getElementById("rightPanelEmpty");
      const rightPanelContent = document.getElementById("rightPanelContent");

      if (rightPanelEmpty) rightPanelEmpty.style.display = "flex";
      if (rightPanelContent) rightPanelContent.style.display = "none";
    });
  });
  // ===== SIDEBAR TOGGLE =====
  const toggleButton = document.getElementById("sidebarToggle");
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
      applyRightPanelWidth(currentActivePanel);
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
  //const rightPanel = document.getElementById("rightPanel");

  sidebarItems.forEach((item) => {
    item.addEventListener("click", function () {
      const panelName = this.getAttribute("data-panel");

      // Save current panel's width before switching
      if (currentActivePanel) {
        const currentWidth = rightPanel.offsetWidth;
        saveRightPanelWidth(currentActivePanel, currentWidth);
      }

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

      // ✅ NEW: Apply saved width for new panel
      applyRightPanelWidth(panelName);

      // ✅ NEW: Update current active panel
      currentActivePanel = panelName;

      // ✅ NEW: Load right panel content for this panel
      loadRightPanelForPanel(panelName);
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
  const modalStar = document.getElementById("modalStar");

  const todoInput = document.getElementById("todoInput");
  const displayDateTime = document.getElementById("displayDateTime");
  const errorBubble = document.getElementById("errorBubble");
  const errorText = document.getElementById("errorText");

  // ===== STAR TOGGLE FUNCTIONALITY =====
  modalStar.addEventListener("click", function () {
    isStarred = !isStarred; // Toggle starred state

    if (isStarred) {
      // Star is now ON
      modalStar.textContent = "★"; // Filled star
      modalStar.classList.add("starred");

      // Add burst animation
      modalStar.classList.add("burst");
      setTimeout(() => {
        modalStar.classList.remove("burst");
      }, 600);
    } else {
      // Star is now OFF
      modalStar.textContent = "☆"; // Empty star
      modalStar.classList.remove("starred");
    }
  });

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
  let currentActivePanel = "home";

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

    isStarred = isImportantPanelActive; // Auto-star if in Important panel
    modalStar.textContent = isStarred ? "★" : "☆";
    modalStar.classList.toggle("starred", isStarred);

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
      starred: isStarred,
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

    // Sort todos by date
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

      // Format date/time display
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

      // Determine what text to display (subject or truncated details)
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

      // Create todo item HTML with star button
      todoItem.innerHTML = `
      <div class="todo-content">
        <input type="checkbox" class="todo-checkbox" ${
          todo.completed ? "checked" : ""
        }>
        <div class="todo-text">
          <p>${todo.starred ? "⭐ " : ""}${displayText}</p>
          ${dateTimeStr}
        </div>
      </div>
      <button class="todo-star" data-id="${todo.id}">${
        todo.starred ? "★" : "☆"
      }</button>
      <button class="todo-delete">🗑️</button>
    `;

      // Checkbox handler
      const checkbox = todoItem.querySelector(".todo-checkbox");
      checkbox.addEventListener("change", function (e) {
        e.stopPropagation();
        todo.completed = this.checked;
        todoItem.classList.toggle("completed", this.checked);

        if (typeof storage !== "undefined") {
          storage.saveTodos(todos);
        }
        displayImportantTodos();
        console.log(
          `✅ Checkbox toggled in Home for: ${todo.subject || todo.text}`
        );
      });

      // Delete button handler
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

      // ⭐ Star button handler (NEW!)
      const starBtn = todoItem.querySelector(".todo-star");
      starBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        todo.starred = !todo.starred;

        // Update star button icon
        this.textContent = todo.starred ? "★" : "☆";

        // Update text with star emoji
        const textP = todoItem.querySelector(".todo-text p");
        const currentText = textP.textContent;

        if (todo.starred) {
          // Add star emoji if not already there
          if (!currentText.startsWith("⭐")) {
            textP.textContent = "⭐ " + currentText;
          }
        } else {
          // Remove star emoji
          textP.textContent = currentText.replace("⭐ ", "");
        }

        // Save to storage
        if (typeof storage !== "undefined") {
          storage.saveTodos(todos);
        }

        // Refresh important panel
        displayImportantTodos();

        console.log(`⭐ Toggled star for: ${todo.subject || todo.text}`);
      });

      // Click handler to show details in right panel
      todoItem.addEventListener("click", function (e) {
        // Don't open detail if clicking checkbox, star, or delete button
        if (
          e.target.classList.contains("todo-checkbox") ||
          e.target.classList.contains("todo-delete") ||
          e.target.classList.contains("todo-star") ||
          e.target.closest(".todo-delete") ||
          e.target.closest(".todo-star")
        ) {
          return;
        }
        showTodoInRightPanel(todo);
      });

      todoListContainer.appendChild(todoItem);
    });
  }

  // ===== RIGHT PANEL MANAGEMENT =====
  const rightPanelEmpty = document.getElementById("rightPanelEmpty");
  const rightPanelContent = document.getElementById("rightPanelContent");

  function showTodoInRightPanel(todo) {
    // Hide empty state, show content
    rightPanelEmpty.style.display = "none";
    rightPanelContent.style.display = "flex";

    // Update banner color (random or from todo)
    const todoBanner = document.getElementById("todoBanner");
    // If TODO doesn't have a saved color, generate one
    if (!todo.bannerColor) {
      todo.bannerColor = Math.floor(Math.random() * 5) + 1;
      // Save the TODO with its new color
      if (typeof storage !== "undefined") {
        storage.saveTodos(todos);
      }
    }
    todoBanner.className = `todo-banner banner-color-${todo.bannerColor}`;

    // Update emoji
    const bannerEmoji = document.getElementById("bannerEmoji");
    bannerEmoji.textContent = todo.emoji || "📝";

    // Update subject
    const todoDetailSubject = document.getElementById("todoDetailSubject");
    todoDetailSubject.textContent = todo.subject || "Untitled Task";

    // Update date/time
    const todoDetailMeta = document.getElementById("todoDetailMeta");
    let metaHTML = "";
    if (todo.date) {
      const dateStr = new Date(todo.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
      metaHTML += `<span>📅 ${dateStr}</span>`;
    }
    if (todo.time) {
      metaHTML += `<span>⏰ ${todo.time}</span>`;
    }
    todoDetailMeta.innerHTML = metaHTML || "<span>No date set</span>";

    // Update original TODO text
    const originalTodoText = document.getElementById("originalTodoText");
    originalTodoText.textContent = todo.text || "No details provided";

    // Load chat messages for this TODO
    loadChatMessages(todo.id);

    // Store current TODO ID globally
    window.currentTodoId = todo.id;
  }

  function hideTodoRightPanel() {
    // Show empty state, hide content
    rightPanelEmpty.style.display = "flex";
    rightPanelContent.style.display = "none";
    window.currentTodoId = null;
  }

  function loadChatMessages(todoId) {
    // This will load chat messages from storage later
    // For now, keep the dummy messages
    console.log("Loading chat for TODO:", todoId);
  }

  function loadRightPanelForPanel(panelName) {
    const rightPanelEmpty = document.getElementById("rightPanelEmpty");
    const rightPanelContent = document.getElementById("rightPanelContent");

    // ✅ Make sure elements exist
    if (!rightPanelEmpty || !rightPanelContent) {
      console.error("Right panel elements not found!");
      return;
    }

    if (panelName === "home") {
      // Home shows todo details when clicked
      // Start with empty state
      rightPanelEmpty.style.display = "flex";
      rightPanelContent.style.display = "none";
    } else if (panelName === "calendar") {
      // Calendar shows empty state with custom message
      rightPanelEmpty.style.display = "flex";
      rightPanelContent.style.display = "none";

      // Update empty state message for calendar
      const emptyStateH3 = rightPanelEmpty.querySelector(".empty-state h3");
      const emptyStateP = rightPanelEmpty.querySelector(".empty-state p");
      if (emptyStateH3) emptyStateH3.textContent = "Calendar View";
      if (emptyStateP)
        emptyStateP.textContent = "Click on a date to create tasks";
    } else if (panelName === "important") {
      // Important shows empty state or starred tasks summary
      rightPanelEmpty.style.display = "flex";
      rightPanelContent.style.display = "none";

      // Update empty state message for important
      const emptyStateH3 = rightPanelEmpty.querySelector(".empty-state h3");
      const emptyStateP = rightPanelEmpty.querySelector(".empty-state p");
      if (emptyStateH3) emptyStateH3.textContent = "Important Tasks";
      if (emptyStateP) emptyStateP.textContent = "Star tasks to see them here";
    } else {
      // Other panels show generic empty state
      rightPanelEmpty.style.display = "flex";
      rightPanelContent.style.display = "none";

      // Reset to default message
      const emptyStateH3 = rightPanelEmpty.querySelector(".empty-state h3");
      const emptyStateP = rightPanelEmpty.querySelector(".empty-state p");
      if (emptyStateH3)
        emptyStateH3.textContent = "Select a TODO to view details";
      if (emptyStateP)
        emptyStateP.textContent =
          "Click on any task to see its chat and details";
    }
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
            <p>⭐ ${displayText}</p>
            ${dateTimeStr}
          </div>
        </div>
        <button class="todo-star" data-id="${todo.id}">${
        todo.starred ? "★" : "☆"
      }</button>
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
        displayTodos();
        console.log(
          `✅ Checkbox toggled in Important for: ${todo.subject || todo.text}`
        );
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

      const starBtn = todoItem.querySelector(".todo-star");
      starBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        todo.starred = !todo.starred;

        // Update star button icon
        this.textContent = todo.starred ? "★" : "☆";

        // Update text with star emoji
        const textP = todoItem.querySelector(".todo-text p");
        const currentText = textP.textContent;

        if (todo.starred) {
          // Add star emoji if not already there
          if (!currentText.startsWith("⭐")) {
            textP.textContent = "⭐ " + currentText;
          }
        } else {
          // Remove star emoji
          textP.textContent = currentText.replace("⭐ ", "");
        }

        // Save to storage
        if (typeof storage !== "undefined") {
          storage.saveTodos(todos);
        }

        // If unstarred, refresh both lists
        displayTodos();
        displayImportantTodos();

        console.log(
          `⭐ Toggled star in Important for: ${todo.subject || todo.text}`
        );
      });
      
      todoItem.addEventListener("click", function (e) {
        // Don't open detail if clicking checkbox, star, or delete button
        if (
          e.target.classList.contains("todo-checkbox") ||
          e.target.classList.contains("todo-delete") ||
          e.target.classList.contains("todo-star") ||
          e.target.closest(".todo-delete") ||
          e.target.closest(".todo-star")
        ) {
          return;
        }
        showTodoInRightPanel(todo);
      });

      importantList.appendChild(todoItem);
    });
  }

  

  // ===== LOAD ON STARTUP =====
  setTimeout(loadTodos, 200);

  // ✅ ADD THIS: Load saved width for home panel
  currentActivePanel = "home";
  applyRightPanelWidth("home");
  loadRightPanelForPanel("home");

  console.log("✅ App ready!");
});
