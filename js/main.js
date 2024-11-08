let header = document.querySelector('header');

window.addEventListener('scroll', () =>{
    header.classList.toggle('shadow', window.scrollY > 0);
});

let menu = document.querySelector('#menu-icon');
let navbar = document.querySelector('.navbar');

menu.onclick = () =>{
    menu.classList.toggle('bx-x');
    navbar.classList.toggle('active');
}
window.onscroll = () =>{
    menu.classList.remove('bx-x');
    navbar.classList.remove('active');
}


// Sample movie data simulating a database fetch
const movies = [
  {
      title: "Venom: The Last Dance",
      genre: "Marvel Universe",
      img: "./img/Venom_img.png",
      bookingLink: "",
      trailerLink: "https://youtu.be/__2bjWbetsA"
  },
  {
      title: "Zack Snyder’s Justice League",
      genre: "DC Extended Universe",
      img: "./img/batman.png",
      bookingLink: "",
      trailerLink: "https://youtu.be/ui37YKQ9AC4"
  }
];

// Function to create home movie slides dynamically
function createHomeSlides() {
  const swiperWrapper = document.getElementById('swiper-wrapper');
  movies.forEach(movie => {
      const slide = document.createElement('div');
      slide.classList.add('swiper-slide', 'container');
      
      slide.innerHTML = `
          <img src="${movie.img}" alt="">
          <div class="home-text">
              <span>${movie.genre}</span>
              <h1>${movie.title}</h1>
              <a href="${movie.bookingLink}" class="btn">Book Now</a>
              <a href="${movie.trailerLink}" class="play">
                  <i class='bx bx-play'></i>
              </a>
          </div>
      `;
      swiperWrapper.appendChild(slide);
  });
}

// Function to create the currently playing movies section
function createMoviesContainer() {
  const moviesContainer = document.getElementById('movies-container');
  movies.forEach(movie => {
      const movieElement = document.createElement('div');
      movieElement.innerHTML = `<h3>${movie.title}</h3>`;
      moviesContainer.appendChild(movieElement);
  });
}


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

  // Call functions to populate data
createHomeSlides();
createMoviesContainer();