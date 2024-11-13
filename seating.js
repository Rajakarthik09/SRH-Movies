// Sample sold seats
const soldSeats = {
    normal: {
      A: [3, 6],
      B: [2, 10],
      D: [5, 14]
    },
    executive: {
      E: [1, 8],
      H: [7]
    }
  };
  
  // Render seat layout
  function renderSeats() {
    // Seat container elements
    const normalContainer = document.getElementById("normal-seats");
    const executiveContainer = document.getElementById("executive-seats");
    
    // Render normal seats (Rows A-D)
    ["A", "B", "C", "D"].forEach(row => {
      const rowElement = normalContainer.querySelector(`[data-row="${row}"]`);
      for (let i = 1; i <= 15; i++) {
        const seat = document.createElement("div");
        seat.className = "seat";
        seat.classList.add(soldSeats.normal[row] && soldSeats.normal[row].includes(i) ? "sold" : "available");
        seat.dataset.row = row;
        seat.dataset.number = i;
        seat.textContent = i;
        rowElement.appendChild(seat);
      }
    });
  
    // Render executive seats (Rows E-H)
    ["E", "F", "G", "H"].forEach(row => {
      const rowElement = executiveContainer.querySelector(`[data-row="${row}"]`);
      for (let i = 1; i <= 15; i++) {
        const seat = document.createElement("div");
        seat.className = "seat";
        seat.classList.add(soldSeats.executive[row] && soldSeats.executive[row].includes(i) ? "sold" : "available");
        seat.dataset.row = row;
        seat.dataset.number = i;
        seat.textContent = i;
        rowElement.appendChild(seat);
      }
    });
  }
  
  // Load selected seats from local storage
  function loadSelectedSeats() {
    const selectedSeats = JSON.parse(localStorage.getItem("selectedSeats")) || [];
    selectedSeats.forEach(seat => {
      const seatElement = document.querySelector(`.seat[data-row="${seat.row}"][data-number="${seat.number}"]`);
      if (seatElement) seatElement.classList.add("selected");
    });
    updatePayButton();
  }
  
  // Save selected seats to local storage
  function saveSelectedSeats() {
    const selectedSeats = Array.from(document.querySelectorAll(".seat.selected"))
      .map(seat => ({ row: seat.dataset.row, number: parseInt(seat.dataset.number) }));
    localStorage.setItem("selectedSeats", JSON.stringify(selectedSeats));
  }
  
  // Update Pay button based on selection
  function updatePayButton() {
    const selectedSeats = document.querySelectorAll(".seat.selected");
    document.getElementById("pay-btn").disabled = selectedSeats.length === 0;
  }
  
  // Event listener for seat selection
  document.addEventListener("click", function(event) {
    if (event.target.classList.contains("seat") && event.target.classList.contains("available")) {
      event.target.classList.toggle("selected");
      saveSelectedSeats();
      updatePayButton();
    }
  });
  
  // Initial setup
  renderSeats();
  loadSelectedSeats();
  