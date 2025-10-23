let currentDate = new Date();
const calendarDates = document.getElementById("calendarDates");
const currentMonthDisplay = document.getElementById("currentMonth");
const prevMonthBtn = document.getElementById("prevMonth");
const nextMonthBtn = document.getElementById("nextMonth");

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

  currentMonthDisplay.textContent = `${monthNames[month]} ${year}`;

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  calendarDates.innerHTML = "";

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Previous month days
  for (let i = firstDay - 1; i >= 0; i--) {
    const dateDiv = createDateElement(
      daysInPrevMonth - i,
      true,
      null,
      true,
      false
    );
    calendarDates.appendChild(dateDiv);
  }

  // Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    const dateObj = new Date(year, month, day);
    dateObj.setHours(0, 0, 0, 0);

    const isPast = dateObj < today;
    const isToday = dateObj.getTime() === today.getTime();

    const dateDiv = createDateElement(day, false, dateObj, isPast, isToday);
    calendarDates.appendChild(dateDiv);
  }

  // Next month days
  const totalCells = calendarDates.children.length;
  const remainingCells = 42 - totalCells;
  for (let i = 1; i <= remainingCells; i++) {
    const dateDiv = createDateElement(i, true, null, false, false);
    calendarDates.appendChild(dateDiv);
  }
}

function createDateElement(day, isOtherMonth, dateObj, isPast, isToday) {
  const dateDiv = document.createElement("div");
  dateDiv.classList.add("calendar-date");

  if (isOtherMonth) dateDiv.classList.add("other-month");
  if (isPast) dateDiv.classList.add("past");
  if (isToday) dateDiv.classList.add("today");

  dateDiv.innerHTML = `
    <span class="star-icon">☆</span>
    <span class="date-number">${day}</span>
  `;

  if (!isOtherMonth && !isPast) {
    dateDiv.addEventListener("click", function () {
      // Send message to parent window to open modal
      if (window.parent && window.parent !== window) {
        window.parent.postMessage(
          {
            type: "openTodoModal",
            date: dateObj.toISOString(),
          },
          "*"
        );
      }
    });

    const starIcon = dateDiv.querySelector(".star-icon");
    starIcon.addEventListener("click", function (e) {
      e.stopPropagation();
      this.classList.toggle("starred");
      this.textContent = this.classList.contains("starred") ? "★" : "☆";
    });
  }

  return dateDiv;
}

// Navigation
prevMonthBtn.addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() - 1);
  renderCalendar();
});

nextMonthBtn.addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  renderCalendar();
});

// Initial render
renderCalendar();
