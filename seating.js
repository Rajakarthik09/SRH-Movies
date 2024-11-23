function getQueryParams() {
  const params = new URLSearchParams(window.location.search);
  return {
      name: params.get('name'),
      time: params.get('time'),
      theater: params.get('theater'),
      day: params.get('day')
  };
}

// Retrieve the query parameters
const { name, time, theater, day } = getQueryParams();

// Log the parameters for debugging purposes
console.log('Received parameters:', { name, time, theater, day });

// Ensure the parameters exist
if (name && time && theater && day) {
  console.log('Valid parameters:', { name, time, theater, day });
} else {
  console.error('Error: Missing one or more required parameters');
}


function fetchAndRenderSeats(movieName, movieTime, theaterName, movieDay) {
  const url = `http://localhost:3000/get_booked_seats?name=${encodeURIComponent(movieName)}&time=${encodeURIComponent(movieTime)}&theater=${encodeURIComponent(theaterName)}&day=${encodeURIComponent(movieDay)}`;
  
  fetch(url)
      .then(response => response.json())
      .then(data => {
          if (data.success) {
              // Initialize the soldSeats object if it doesn't exist
              const soldSeats = { normal: {} };

              // If bookedSeats is not an object, log it to understand its structure
              if (typeof data.bookedSeats !== 'object' || Array.isArray(data.bookedSeats)) {
                  console.error('Booked seats is not an object:', data.bookedSeats);
              } else {
                  // Iterate over bookedSeats object (which has rows as keys)
                  Object.keys(data.bookedSeats).forEach(row => {
                      const seatNumbers = data.bookedSeats[row]; // Get the seat numbers for this row
                      if (Array.isArray(seatNumbers)) {
                          seatNumbers.forEach(seatNumber => {
                              // Add the seat number to the corresponding row
                              if (!soldSeats.normal[row]) {
                                  soldSeats.normal[row] = [];
                              }

                              // Ensure seat number is a valid integer and then push it
                              soldSeats.normal[row].push(seatNumber);
                          });
                      } else {
                          console.error(`Invalid seat numbers for row ${row}:`, seatNumbers);
                      }
                  });
              }

              // Call the renderSeats function with the formatted soldSeats
              renderSeats(soldSeats);
          } else {
              console.error('Failed to fetch booked seats:', data.message);
          }
      })
      .catch(error => console.error('Error:', error));
}

// Function to render the seats (e.g., A1, A2, etc.)
function renderSeats(soldSeats) {
  // Seat container elements
  const normalContainer = document.getElementById("normal-seats");

  // Render normal seats (Rows A-D)
  ["A", "B", "C", "D"].forEach(row => {
      const rowElement = normalContainer.querySelector(`[data-row="${row}"]`);

      for (let i = 1; i <= 5; i++) {
          const seat = document.createElement("div");
          seat.className = "seat";

          // If seat is booked, mark it as 'sold'
          seat.classList.add(soldSeats.normal && soldSeats.normal[row] && soldSeats.normal[row].includes(i) ? "sold" : "available");

          seat.dataset.row = row;
          seat.dataset.number = i;
          seat.textContent = `${row}${i}`; // Display seat as A1, A2, etc.

          rowElement.appendChild(seat);
      }
  });
}  

// Call the function on page load
const urlParams = new URLSearchParams(window.location.search);
const movieName = urlParams.get('name'); // Get movie name from URL
const movieTime = urlParams.get('time');
const theaterName = urlParams.get('theater');
const movieDay = urlParams.get('day');

if (movieName && movieTime && theaterName && movieDay) {
    fetchAndRenderSeats(movieName, movieTime, theaterName, movieDay);
} else {
    console.error('Error: Missing required URL parameters');
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
loadSelectedSeats();

// Function to book the selected seats
function bookSeats() {
  // Retrieve the selected seats from local storage or current selection
  const selectedSeats = JSON.parse(localStorage.getItem("selectedSeats")) || [];

  // Get movie and theater details from the URL query parameters
  const { name, time, theater, day } = getQueryParams();

  // Check if seats are selected and all details are present
  if (selectedSeats.length === 0) {
      alert("Please select at least one seat.");
      return;
  }

  if (!name || !time || !theater || !day) {
      console.error("Error: Missing movie or theater details.");
      return;
  }

  // Prepare the data to send to the server
  const bookingData = {
      email: localStorage.getItem("userEmail"),  // Hardcoded email, change this to dynamically fetch from user login
      movie_name: name,
      time: time,
      theater: theater,
      day: day,
      seat_numbers: selectedSeats.map(seat => `${seat.row}${seat.number}`), // Format selected seats as A1, A2, etc.
      status: "Confirmed"
  };

  // Send the booking data to the server via POST request
  fetch("http://localhost:3000/book_seat", {
      method: "POST",
      headers: {
          "Content-Type": "application/json"
      },
      body: JSON.stringify(bookingData)
  })
  .then(response => response.json())
  .then(data => {
      if (data.success) {
          alert("Seats booked successfully!");
          // Optionally, you can redirect the user to a confirmation page
          window.location.reload();
      } else {
          console.error("Booking failed:", data.message);
          alert("Failed to book seats. Please try again.");
      }
  })
  .catch(error => {
      console.error("Error booking seats:", error);
      alert("Error booking seats. Please try again later.");
  });
}

// Event listener for the "Pay Now" button click
document.getElementById("pay-btn").addEventListener("click", bookSeats);