import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const apiKey = '30908520-61e3e7767732b591b87412aca';
const lightbox = new SimpleLightbox('.gallery a', {
  docClose: true,
  captionsData: 'alt',
  captionDelay: 250,
});

const searchFormRef = document.querySelector('#search-form');
const galleryRef = document.querySelector('.gallery');
const buttonLoadMoreRef = document.querySelector('.load-more');

let page;
let searchValue;
let totalShowed;

searchFormRef.addEventListener('submit', event => {
  event.preventDefault();
  galleryRef.innerHTML = '';
  const [input] = event.target;

  page = 1;
  totalShowed = 0;
  searchValue = input.value;
  fetchByName(searchValue, 1);
});

window.addEventListener('load', () => {
  buttonLoadMoreRef.style.display = 'none';
  buttonLoadMoreRef.style.visibility = 'hidden';
});

galleryRef.addEventListener('click', event => event.preventDefault());

buttonLoadMoreRef.addEventListener('click', () => {
  fetchByName(searchValue, ++page);
});

async function fetchByName(name, page) {
    try{
        const response = await fetch(makeURL(name, page));
        const result = await response.json();
        renderResult(result);
    }catch(error){
        renderError(error);
    }
}

function makeURL(name, page){
    return `https://pixabay.com/api/?key=${apiKey}&q=${name}&image_type=photo&orientation=horizontal&safesearch=true&per_page=40&page=${page}`
}

function renderResult(result) {
  if (result.hits.length == 0) {
    Notiflix.Notify.failure('Sorry, there are no images matching your search query. Please try again.');
    return;
  }
  if (page == 1) {
    Notiflix.Notify.success(`Hooray! We found ${result.totalHits} images.`);
  }
  totalShowed += result.hits.length;
  if (totalShowed >= result.totalHits) {
    Notiflix.Notify.info(`We're sorry, but you've reached the end of search results.`);
  }
  galleryRef.innerHTML += result.hits.map(createResult).join('');
  buttonLoadMoreRef.style.display = 'block';
  buttonLoadMoreRef.style.visibility = 'visible';

  const { height: cardHeight } = document
    .querySelector('.gallery')
    .firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
  lightbox.refresh();
}

function createResult({
  webformatURL,
  largeImageURL,
  tags,
  likes,
  views,
  comments,
  downloads,
}) {
  return `<a class='gallery__item' href="${largeImageURL}">
    <div class='photo-card'>
        <img src="${webformatURL}" alt="${tags}" loading="lazy"/>
        <div class='info'>
            <p class="info-item"><b>Likes </b>${likes}</p>
            <p class="info-item"><b>Views </b>${views}</p>
            <p class="info-item"><b>Comments </b>${comments}</p>
            <p class="info-item"><b>Downloads </b>${downloads}</p>
        </div>
    </div>
    </a>`;
}

function renderError(result) {
  Notiflix.Notify.failure('Something goes wrong! ' + result.message);
}
