let header = document.querySelector('header');

window.addEventListener('scroll', () => {
    header.classList.toggle('shadow', window.scrollY > 0);
});

let menu = document.querySelector('#menu-icon');
let navbar = document.querySelector('.navbar');

menu.onclick = () => {
    menu.classList.toggle('bx-x');
    navbar.classList.toggle('active');
}
window.onscroll = () => {
    menu.classList.remove('bx-x');
    navbar.classList.remove('active');
}

// Function to fetch movies from the backend
async function fetchMovies() {
    try {
        const response = await fetch('http://localhost:3200/movies'); // Endpoint URL
        const data = await response.json();

        if (data.success) {
            const movies = data.data; // Movies fetched from the database
            createHomeSlides(movies);
            createMoviesContainer(movies);
        } else {
            console.error('Failed to fetch movies:', data.message);
        }
    } catch (err) {
        console.error('Error fetching movies:', err);
    }
}

// Function to create home movie slides dynamically
function createHomeSlides(movies) {
    const swiperWrapper = document.getElementById('swiper-wrapper');
    swiperWrapper.innerHTML = ''; // Clear existing content
    movies.forEach(movie => {
        const slide = document.createElement('div');
        slide.classList.add('swiper-slide', 'container');
        
        slide.innerHTML = `
            <img src="${movie.img || './img/default.png'}" alt="${movie.name}">
            <div class="home-text">
                <span>${movie.genre}</span>
                <h1>${movie.name}</h1>
                <a href="${movie.bookingLink || '#'}" class="btn">Book Now</a>
                <a href="${movie.trailerLink || '#'}" class="play">
                    <i class='bx bx-play'></i>
                </a>
            </div>
        `;
        swiperWrapper.appendChild(slide);
    });
}

// Function to create the currently playing movies section
function createMoviesContainer(movies) {
    const moviesContainer = document.getElementById('movies-container');
    moviesContainer.innerHTML = ''; // Clear existing content
    movies.forEach(movie => {
        const movieElement = document.createElement('div');
        movieElement.innerHTML = `
            <div class="movie-card">
                <h3>${movie.name}</h3>
                <p>${movie.genre}</p>
            </div>
        `;
        moviesContainer.appendChild(movieElement);
    });
}

// Swiper for home slides
var swiper = new Swiper(".home", {
    spaceBetween: 30,
    centeredSlides: true,
    autoplay: {
        delay: 4000,
        disableOnInteraction: false,
    },
    pagination: {
        el: ".swiper-pagination",
        clickable: true,
    },
});

// Swiper for coming soon movies
var swiper = new Swiper(".coming-container", {
    spaceBetween: 20,
    loop: true,
    centeredSlides: true,
    autoplay: {
        delay: 2000,
        disableOnInteraction: false,
    },
    breakpoints: {
        0: {
            slidesPerView: 2,
        },
        568: {
            slidesPerView: 3,
        },
        768: {
            slidesPerView: 4,
        },
        968: {
            slidesPerView: 5,
        },
    }
});

// Fetch and populate movie data
fetchMovies();