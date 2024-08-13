const apiUrl = 'http://www.omdbapi.com/';
const apiKey = 'c5ebd97a';

const searchInput = document.querySelector('#input-search');
const searchBtn = document.querySelector('#btn-search');
const movieList = document.querySelector('.movies-articles');
const paginationContainer = document.querySelector('.pagination');
const cartCountNumber = document.querySelector('.cart-count');
const cartTable = document.querySelector('.cart-table');
const btnCart = document.querySelector("#btn-view-cart");

let cart = [];
let currentPage = 1;
let totalPages = 1;
let searchTerm = '';
let cartCount = 0;

// Initialize cart from session storage
if (sessionStorage.getItem('cart')) {
  cart = JSON.parse(sessionStorage.getItem('cart'));
  cartCount = cart.length;
  cartCountNumber.innerHTML = cartCount;
}


btnCart.addEventListener('click', () => {
  viewCart();
});

searchBtn.addEventListener('click', (e) => {
  e.preventDefault(); // prevent form submission
  searchTerm = searchInput.value.trim();
  currentPage = 1; // reset to 1
  searchMovies(searchTerm);
});

// Add an event listener to the close button
const closeModal = document.querySelector('.close');
closeModal.addEventListener('click', () => {
  const cartModal = document.getElementById('cart-modal');
  cartModal.classList.remove('show'); // toggle modal visibility
});

const searchMovies = (searchTerm) => {
  const url = `${apiUrl}?apikey=${apiKey}&s=${searchTerm}&page=${currentPage}`;
  fetch(url)
    .then(response => response.json())
    .then(data => {
      const movies = data.Search;
      totalPages = Math.ceil(data.totalResults / 10);
      renderMovieList(movies);
      renderPagination();
    })
    .catch(error => console.error(error));
}

const renderMovieList = (movies) => {
  const movieList = document.querySelector('.movies-articles');
  movieList.innerHTML = '';
  movies.forEach(movie => {
    const movieHTML = `
      <article>
        <img src="${movie.Poster}" alt="${movie.Title}">
        <h3>${movie.Title}</h3>
        <p>${movie.Year}</p>
        <button class="btn-cart" data-movie-id="${movie.imdbID}"><i class="fa fa-shopping-cart"></i> Add To Cart</button>
      </article>
    `;
    movieList.innerHTML += movieHTML;
  });
  addEventListenersToMovieButtons();
}

const renderPagination = () => {
    paginationContainer.innerHTML = '';
    const pageButtonFirst = document.createElement('button');
    const pageButtonLast = document.createElement('button');
    pageButtonFirst.textContent = "<<";
    pageButtonFirst.addEventListener('click', () => {
        currentPage = 1;
        searchMovies(searchTerm);
    });
    paginationContainer.appendChild(pageButtonFirst);

    for (let i = 1; i <= totalPages; i++) {
        const pageButton = document.createElement('button');
        
        pageButton.textContent = i;
        pageButton.addEventListener('click', () => {
            currentPage = i; // update current page
            searchMovies(searchTerm); // fetch movies for the selected page
        });
       
        
        paginationContainer.appendChild(pageButton);
    }

    pageButtonLast.textContent = ">>";
    pageButtonLast.addEventListener('click', () => {
        currentPage = totalPages;
        searchMovies(searchTerm);
    });

    paginationContainer.appendChild(pageButtonLast);
}

const viewCart = () => {
  const cartModal = document.getElementById('cart-modal');
  cartModal.classList.add('show'); // toggle modal visibility

  const cartTable = document.getElementById('cart-table');
  cartTable.innerHTML = ''; // clear the table content

  const tableHeader = `
    <tr>
      <th>Movie Title</th>
      <th>Year</th>
      <th>Remove</th>
    </tr>
  `;
  cartTable.innerHTML += tableHeader;
  cartTable.addEventListener('click', (e) => {
    if (e.target.classList.contains('btn-remove')) {
      removeButtonHandler(e);
    }
  });
  cart.forEach((movieId, index) => {
    const url = `${apiUrl}?apikey=${apiKey}&i=${movieId}`;
    fetch(url)
      .then(response => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error('API request failed');
        }
      })
      .then(data => {
        const movie = data;
        const tableRow = `
          <tr>
            <td>${movie.Title}</td>
            <td>${movie.Year}</td>
            <td><button class="btn-remove" data-movie-id="${movieId}">X</button></td>
          </tr>
        `;
        cartTable.innerHTML += tableRow;
      })
      .catch(error => console.error(error));
  });

  // Call addEventListenersToRemoveButtons after the cart table has been updated
  addEventListenersToRemoveButtons(); // add event listeners to remove buttons
  updateCartCount(); // update cart count
}


const removeButtonHandler = (e) => {
  console.log('Remove button clicked!');
  const movieId = e.target.dataset.movieId;
  console.log(`Movie ID: ${movieId}`);
  const index = cart.indexOf(movieId);
  if (index > -1) {
    cart.splice(index, 1);
    console.log(`Cart updated: ${cart}`);
    setSession(); // update session storage
  }
  updateCartCount();
  viewCart(); // update the cart table
  // console.log('Cart count:', cartCount);
  // console.log('Session storage:', sessionStorage.getItem('cart'));
}

const setSession = () => {
  sessionStorage.setItem('cart', JSON.stringify(cart));
}

const updateCartCount = () => {
  cartCount = cart.length;
  cartCountNumber.innerHTML = cartCount;
}

const addEventListenersToRemoveButtons = () => {
  const removeButtons = document.querySelectorAll('.btn-remove');
  removeButtons.forEach(button => {
    button.addEventListener('click', removeButtonHandler);
  });
}

const addEventListenersToMovieButtons = () => {
  const movieButtons = document.querySelectorAll('.btn-cart');
  movieButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      const movieId = e.target.dataset.movieId;
      if (!cart.includes(movieId)) {
        cart.push(movieId);
        setSession(); // update session storage
      }
      updateCartCount();
    });
  });
}


