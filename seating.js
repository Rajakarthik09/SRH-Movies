// Function to retrieve query parameters
function getQueryParams() {
  const params = new URLSearchParams(window.location.search);
  return {
      name: params.get("name"),
      time: params.get("time"),
      theater: params.get("theater"),
      day: params.get("day"),
  };
}

// Retrieve the query parameters
const { name, time, theater, day } = getQueryParams();

// Log the parameters for debugging purposes
console.log("Received parameters:", { name, time, theater, day });

// Ensure the parameters exist
if (name && time && theater && day) {
  console.log("Valid parameters:", { name, time, theater, day });
} else {
  console.error("Error: Missing one or more required parameters");
}

// Function to fetch and render booked seats
function fetchAndRenderSeats(movieName, movieTime, theaterName, movieDay) {
  const url = `http://localhost:3000/get_booked_seats?name=${encodeURIComponent(movieName)}&time=${encodeURIComponent(movieTime)}&theater=${encodeURIComponent(theaterName)}&day=${encodeURIComponent(movieDay)}`;

  fetch(url)
      .then((response) => response.json())
      .then((data) => {
          if (data.success) {
              // Initialize the soldSeats object
              const soldSeats = { normal: {} };

              // Validate the structure of bookedSeats
              if (typeof data.bookedSeats !== "object" || Array.isArray(data.bookedSeats)) {
                  console.error("Booked seats is not an object:", data.bookedSeats);
              } else {
                  // Format the bookedSeats data
                  Object.keys(data.bookedSeats).forEach((row) => {
                      const seatNumbers = data.bookedSeats[row];
                      if (Array.isArray(seatNumbers)) {
                          soldSeats.normal[row] = seatNumbers.map(Number);
                      } else {
                          console.error(`Invalid seat numbers for row ${row}:`, seatNumbers);
                      }
                  });
              }

              // Render seats
              renderSeats(soldSeats);
          } else {
              console.error("Failed to fetch booked seats:", data.message);
          }
      })
      .catch((error) => console.error("Error:", error));
}

// Function to render the seat chart
function renderSeats(soldSeats) {
  const normalContainer = document.getElementById("normal-seats");

  // Render normal seats (Rows A-D)
  ["A", "B", "C", "D"].forEach((row) => {
      const rowElement = normalContainer.querySelector(`[data-row="${row}"]`);
      for (let i = 1; i <= 5; i++) {
          const seat = document.createElement("div");
          seat.className = "seat";

          // Mark as sold or available
          seat.classList.add(
              soldSeats.normal[row] && soldSeats.normal[row].includes(i) ? "sold" : "available"
          );

          seat.dataset.row = row;
          seat.dataset.number = i;
          seat.textContent = `${row}${i}`;

          rowElement.appendChild(seat);
      }
  });
}

// Function to load selected seats from local storage
function loadSelectedSeats() {
  const selectedSeats = JSON.parse(localStorage.getItem("selectedSeats")) || [];
  selectedSeats.forEach((seat) => {
      const seatElement = document.querySelector(
          `.seat[data-row="${seat.row}"][data-number="${seat.number}"]`
      );
      if (seatElement) seatElement.classList.add("selected");
  });
  updatePayButton();
}

// Function to save selected seats to local storage
function saveSelectedSeats() {
  const selectedSeats = Array.from(document.querySelectorAll(".seat.selected")).map((seat) => ({
      row: seat.dataset.row,
      number: parseInt(seat.dataset.number),
  }));
  localStorage.setItem("selectedSeats", JSON.stringify(selectedSeats));
}

// Function to update the Pay button state
function updatePayButton() {
  const selectedSeats = document.querySelectorAll(".seat.selected");
  document.getElementById("pay-btn").disabled = selectedSeats.length === 0;
  updateTotalPrice();
}

// Function to calculate and update the total price
function updateTotalPrice() {
  const TICKET_PRICE = 150;
  const selectedSeats = document.querySelectorAll(".seat.selected");
  const totalPrice = selectedSeats.length * TICKET_PRICE;

  document.getElementById("total-price").textContent = `Total Price: Rs. ${totalPrice}`;
}

// Event listener for seat selection
document.addEventListener("click", function (event) {
  if (event.target.classList.contains("seat") && event.target.classList.contains("available")) {
      event.target.classList.toggle("selected");
      saveSelectedSeats();
      updatePayButton();
  }
});

// Function to book selected seats
function bookSeats() {
  const selectedSeats = JSON.parse(localStorage.getItem("selectedSeats")) || [];
  const { name, time, theater, day } = getQueryParams();

  if (selectedSeats.length === 0) {
      alert("Please select at least one seat.");
      return;
  }

  if (!name || !time || !theater || !day) {
      console.error("Error: Missing movie or theater details.");
      return;
  }

  const bookingData = {
      email: localStorage.getItem("userEmail"), // Replace with dynamic email from user session
      movie_name: name,
      time: time,
      theater: theater,
      day: day,
      seat_numbers: selectedSeats.map((seat) => `${seat.row}${seat.number}`),
      status: "Confirmed",
  };

  fetch("http://localhost:3000/book_seat", {
      method: "POST",
      headers: {
          "Content-Type": "application/json",
      },
      body: JSON.stringify(bookingData),
  })
      .then((response) => response.json())
      .then((data) => {
          if (data.success) {
              alert("Seats booked successfully!");
              window.location.reload();
          } else {
              console.error("Booking failed:", data.message);
              alert("Failed to book seats. Please try again.");
          }
      })
      .catch((error) => {
          console.error("Error booking seats:", error);
          alert("Error booking seats. Please try again later.");
      });
}

// Event listener for the "Pay Now" button click
document.getElementById("pay-btn").addEventListener("click", bookSeats);

// Initial setup
if (name && time && theater && day) {
  fetchAndRenderSeats(name, time, theater, day);
} else {
  console.error("Error: Missing required URL parameters");
}

loadSelectedSeats();