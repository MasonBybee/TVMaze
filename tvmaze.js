"use strict";

const $showsList = $("#shows-list");
const $episodesArea = $("#episodes-area");
const $searchForm = $("#search-form");
const $modalList = $("#modal-list");
const $modal = $('#Modal')

/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

async function getShowsByTerm(term) {
  const res = await axios.get(
    `http://api.tvmaze.com/search/shows?q=${term}`
  );
  return res.data
  
    }


/** Given list of shows, create markup for each and to DOM */

async function populateShows(shows) {
  $showsList.empty();

  for (let show of shows) {
const img =
  show.show.image?.original ||
  "https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/No-Image-Placeholder.svg/330px-No-Image-Placeholder.svg.png";
    const summary =
      show.show.summary ||
      "No Summary Available";
    const $show = $(
      `<div id="show" data-show-id="${show.show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img 
              src="${img}" 
              alt="${show.show.name}" 
              class="w-25 mr-3">
           <div class="media-body">
             <h5 class="text-primary">${show.show.name}</h5>
             <div><small>${summary}</small></div>
            <button id ='episodesBtn' type="button" class="btn btn-primary" data-toggle="modal" data-target="#ModalCenter">
            Episodes
            </button>
           </div>
         </div>  
       </div>
      `
    );

    $showsList.append($show);  }
}


/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchForShowAndDisplay() {
  let term = $("#search-query").val();
  term = term.replace(/ /g, '+')
  const shows = await getShowsByTerm(term);

  $episodesArea.hide();
  populateShows(shows);
}

$searchForm.on("submit", async function (evt) {
  evt.preventDefault();
  await searchForShowAndDisplay();
});


/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */

async function getEpisodesOfShow(id) { 
  // create container array
  const episodeArr = []
  // get eipisodes from api
  const episodes = (await axios.get(`http://api.tvmaze.com/shows/${id}/episodes`)).data;
  // loop through episodes and create and push new objects to container array
  for (let episode of episodes) {
    episodeArr.push({
      id: episode.id,
      name: episode.name,
      season: episode.season,
      number: episode.number,
    });
  }
  return episodeArr
}



async function populateEpisodes(episodes) { 
  //reset modal
  $modalList.html('')
  // loop through episdoes array and put into html
  for (let episode of episodes) {
    const $show = $(
      `<li>
          <ul>
            <li>
            Season ${episode.season} Episode ${episode.number}
            </li>
            <li>
            Episode Name :  ${episode.name}
            </li>
          </ul>
          <br>
        </li>
      `
    );
      //append each show to list
    $modalList.append($show);
  }
  // sets modal to visable 
  $modal.modal('show');
}

// delegated click listener for episode buttons
$showsList.on('click', "#episodesBtn", async function () {
  //get id
  const id = $(this).closest("#show").data("show-id");
  // get episodes of id
  const episodes = await getEpisodesOfShow(id)
  // populate modal
  populateEpisodes(episodes)
});
// event listener to close modal
$('.close').click(async function () {
  $modal.modal("hide");
})