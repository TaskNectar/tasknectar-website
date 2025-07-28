document.addEventListener("DOMContentLoaded", () => {
  const monthSelect = document.getElementById("month");
  const yearSelect = document.getElementById("year");
  const calendarPreview = document.getElementById("calendar-preview");

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Populate month dropdown
  monthNames.forEach((month, index) => {
    const option = document.createElement("option");
    option.value = index;
    option.textContent = month;
    monthSelect.appendChild(option);
  });

  // Populate year dropdown (current year +/- 10 years)
  const currentYear = new Date().getFullYear();
  for (let y = currentYear - 10; y <= currentYear + 10; y++) {
    const option = document.createElement("option");
    option.value = y;
    option.textContent = y;
    yearSelect.appendChild(option);
  }

  // Set current date as default
  const today = new Date();
  monthSelect.value = today.getMonth();
  yearSelect.value = today.getFullYear();

  function generateCalendar(month, year) {
    const firstDay = new Date(year, month).getDay(); // day of week (0-6)
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    let calendarHTML = `<div class="calendar-header"><h2>${monthNames[month]} ${year}</h2></div>`;
    calendarHTML += `
      <table class="calendar-table">
        <thead>
          <tr>
            <th>Sun</th><th>Mon</th><th>Tue</th><th>Wed</th>
            <th>Thu</th><th>Fri</th><th>Sat</th>
          </tr>
        </thead>
        <tbody>
    `;

    let date = 1;
    for (let i = 0; i < 6; i++) {
      calendarHTML += "<tr>";
      for (let j = 0; j < 7; j++) {
        if (i === 0 && j < firstDay) {
          calendarHTML += "<td></td>";
        } else if (date > daysInMonth) {
          calendarHTML += "<td></td>";
        } else {
          calendarHTML += `<td>${date}</td>`;
          date++;
        }
      }
      calendarHTML += "</tr>";
      if (date > daysInMonth) break;
    }

    calendarHTML += "</tbody></table>";
    calendarPreview.innerHTML = calendarHTML;
  }

  // Generate default calendar
  generateCalendar(today.getMonth(), today.getFullYear());

  // Update on change
  monthSelect.addEventListener("change", () => {
    generateCalendar(parseInt(monthSelect.value), parseInt(yearSelect.value));
  });

  yearSelect.addEventListener("change", () => {
    generateCalendar(parseInt(monthSelect.value), parseInt(yearSelect.value));
  });

  // Print button
  document.getElementById("print").addEventListener("click", () => {
    setTimeout(() => {
      window.print();
    }, 100);
  });

  // Download PDF
  document.getElementById("download").addEventListener("click", () => {
    const element = document.getElementById("calendar-preview");
    const opt = {
      margin: 0.5,
      filename: 'calendar.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter' }
    };
    html2pdf().set(opt).from(element).save();
  });
});
