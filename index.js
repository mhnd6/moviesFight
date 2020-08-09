const autocompleteConfig = {
  renderOption(movie) {
    const imageSrc = movie.Poster === "N/A" ? "" : movie.Poster;
    return `
    <img src="${imageSrc}" />
    ${movie.Title} (${movie.Year})
    `;
  },
  inputValue(movie) {
    return movie.Title;
  },
  async fetchData(searchTerm) {
    const response = await axios.get("http://www.omdbapi.com", {
      params: {
        apikey: "cab1cdac",
        s: searchTerm,
      },
    });

    if (response.data.Error) {
      return [];
    }

    return response.data.Search;
  },
};

createAutoComplete({
  ...autocompleteConfig,
  root: document.querySelector("#left-autocomplete"),
  onOptionSelect(movie) {
    document.querySelector(".tutorial").classList.add("is-hidden");
    onMovieSelect(movie, document.querySelector("#left-summary"), "left");
  },
});
createAutoComplete({
  ...autocompleteConfig,
  root: document.querySelector("#right-autocomplete"),
  onOptionSelect(movie) {
    document.querySelector(".tutorial").classList.add("is-hidden");
    onMovieSelect(movie, document.querySelector("#right-summary"), "right");
  },
});

let leftMovie;
let rightMovie;
const onMovieSelect = async (movie, summary, side) => {
  const response = await axios.get("http://www.omdbapi.com", {
    params: {
      apikey: "cab1cdac",
      i: movie.imdbID,
    },
  });

  summary.innerHTML = movieTemplate(response.data);

  if (side === "left") {
    leftMovie = response.data;
  } else {
    rightMovie = response.data;
  }

  if (leftMovie && rightMovie) {
    runComparison();
  }
};

const runComparison = () => {
  const leftSideStats = document.querySelectorAll(
    "#left-summary .notification"
  );
  const rightSideStats = document.querySelectorAll(
    "#right-summary .notification"
  );

  leftSideStats.forEach((leftStat, index) => {
    const rightStat = rightSideStats[index];

    const leftSideValue = parseInt(leftStat.dataset.value);
    const rightSideValue = parseInt(rightStat.dataset.value);

    if (rightSideValue > leftSideValue) {
      leftStat.classList.remove("is-primary");
      leftStat.classList.add("is-warning");
    } else {
      rightStat.classList.remove("is-primary");
      rightStat.classList.add("is-warning");
    }
  });
};

const movieTemplate = (Detail) => {
  const dollars = parseInt(
    Detail.BoxOffice.replace(/\$/g, "").replace(/,/g, "")
  );

  const metascore = parseInt(Detail.Metascore);
  const imdbRating = parseFloat(Detail.imdbRating);
  const imdbVotes = parseInt(Detail.imdbVotes.replace(/,/g, ""));

  console.log(imdbVotes);

  const awards = Detail.Awards.split(" ").reduce((prev, word) => {
    const value = parseInt(word);

    if (isNaN(value)) {
      return prev;
    } else {
      return prev + value;
    }
  }, 0);

  return `
  <article class="media">
    <figure class="media-left">
      <p class="image">
        <img src="${Detail.Poster}"/>
      </p>
    </figure>
    <div class="media-content">
      <div class="content">
        <h1>${Detail.Title}</h1>
        <h4>${Detail.Genre}</h4>
        <p>${Detail.Plot}</p>
      </div>
    </div>
  </article>
  <article data-value=${awards} class="notification is-primary">
    <p class="title">${Detail.Awards}</p>
    <p class="subtitle">Awards</p>
  </article>
  <article  data-value=${dollars} class="notification is-primary">
    <p class="title">${Detail.BoxOffice}</p>
    <p class="subtitle">Box Office</p>
  </article>
  <article  data-value=${metascore} class="notification is-primary">
    <p class="title">${Detail.Metascore}</p>
    <p class="subtitle">Metascore</p>
  </article>
  <article  data-value=${imdbRating} class="notification is-primary">
    <p class="title">${Detail.imdbRating}</p>
    <p class="subtitle">imdb Rating</p>
  </article>
  <article  data-value=${imdbVotes} class="notification is-primary">
    <p class="title">${Detail.imdbVotes}</p>
    <p class="subtitle">imdb Votes</p>
  </article>
  `;
};
