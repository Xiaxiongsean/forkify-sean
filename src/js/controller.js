import * as model from './model.js';
import { MODAL_CLOSE_SEC } from './config.js';
import RecipeView from './views/recipeView.js';
import SearchView from './views/searchView.js';
// import recipeView from './views/recipeView.js';
// import resultsView from './views/resultsView.js';
import ResultsView from './views/resultsView.js';
import BookmarksView from './views/bookmarksView.js';
import PaginationView from './views/paginationView.js';
import AddRecipeView from './views/addRecipeView';

import { async } from 'regenerator-runtime';
import 'core-js/stable';
import 'regenerator-runtime/runtime';
// import resultsView from './views/resultsView.js';
// import addRecipeView from './views/addRecipeView';
// if (module.hot) {
//   module.hot.accept();
// }
// https://forkify-api.herokuapp.com/v2

///////////////////////////////////////

const controlRecipe = async function () {
  try {
    const id = window.location.hash.slice(1);

    if (!id) return;
    RecipeView.renderSpinner();

    //0 update results view to mark selected search result
    ResultsView.update(model.getSearchResultsPage());
    // 1) Updating bookmarks view
    BookmarksView.update(model.state.bookmarks);

    // 2) Loading recipe
    await model.loadRecipe(id);

    // 3) Rendering recipe
    RecipeView.render(model.state.recipe);
  } catch (err) {
    RecipeView.renderError();
    console.error(err);
  }
};
const controlSearchResults = async function () {
  try {
    ResultsView.renderSpinner();
    //1 Get search query
    const query = SearchView.getQuery();
    if (!query) return;
    //2 load search results
    await model.loadSearchResults(query);
    //3 Render results
    ResultsView.render(model.getSearchResultsPage());
    //4 render initial pagination buttons
    PaginationView.render(model.state.search);
  } catch (err) {
    console.log(err);
  }
};

const controlPagination = function (goToPage) {
  //1 Render new results
  ResultsView.render(model.getSearchResultsPage(goToPage));
  //2 render new pagination buttons
  PaginationView.render(model.state.search);
};

const controlServings = function (newServings) {
  //update the recipe servings(in state)
  model.updateServings(newServings);
  //update the recipe view
  // RecipeView.render(model.state.recipe);
  RecipeView.update(model.state.recipe);
};

const controlAddBookmark = function () {
  //1 add or remove bookmark
  if (!model.state.recipe.bookmarked) model.addBookMark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id);
  //2 update recipe review
  RecipeView.update(model.state.recipe);
  //3 Render bookmarks
  BookmarksView.render(model.state.bookmarks);
};
const controlBoookmarks = function () {
  BookmarksView.render(model.state.bookmarks);
};

const controlAddRecipe = async function (newRecipe) {
  try {
    //loading spinner
    AddRecipeView.renderSpinner();
    //upload new recipe data
    await model.uploadRecipe(newRecipe);
    console.log(model.state.recipe);

    //render recipe
    RecipeView.render(model.state.recipe);
    //Success message
    AddRecipeView.renderMessage();

    //render bookmark
    BookmarksView.render(model.state.bookmarks);

    //change ID in URL
    window.history.pushState(null, '', `#${model.state.recipe.id}`);

    //close form window
    setTimeout(function () {
      AddRecipeView.toggleWindow(), MODAL_CLOSE_SEC * 1000;
    });
  } catch (err) {
    console.error('⛔⛔', err);
    AddRecipeView.renderError(err.message);
  }
};

const init = function () {
  BookmarksView.addHandlerRender(controlBoookmarks);
  RecipeView.addhandlerRender(controlRecipe);
  RecipeView.addhandlerUpdateServings(controlServings);
  RecipeView.addhandlerAddBookmark(controlAddBookmark);
  SearchView.addHandlerSearch(controlSearchResults);
  PaginationView.addHandlerClick(controlPagination);
  AddRecipeView._addHandlerUpload(controlAddRecipe);
};
init();
