//States
let arrayOfNews = [];

// Document Queries
const newsArena = document.querySelector("main#news-arena");
const newsSpinner = newsArena.querySelector("div#news-spinner");
const foundNumberAndCategoryElement = newsArena.querySelector(
  "div#number-of-found-news"
);
const newsCardsElement = newsArena.querySelector("section#news-cards");
const numberOfFoundNewsElement =
  foundNumberAndCategoryElement.querySelector("span:nth-child(1)");
const foundNewsInCategoryElement =
  foundNumberAndCategoryElement.querySelector("span:nth-child(2)");

//Show Network Error Modal
function showNetworkErrorModal() {
  new bootstrap.Modal("#network-error-modal").show();
}

// REST API Endpoints
const listOfCategoriesEndpoint =
  "https://openapi.programming-hero.com/api/news/categories";

const allNewsOfACategoryEndpoint =
  "https://openapi.programming-hero.com/api/news/category/";

const detailOfANewsEndpoint = "https://openapi.programming-hero.com/api/news/";

// General Fetch Function

async function fetchData(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Response Not OK");
    }
    const responseBody = await response.json();
    // if (!responseBody["status"]) {
    //   throw new Error("Status False");
    // }
    return responseBody["data"];
  } catch (error) {
    console.log(error);
    showNetworkErrorModal();
    throw error;
  }
}

// Load Categories from Network

async function loadCategories() {
  const data = await fetchData(listOfCategoriesEndpoint);
  return data["news_category"];
}

// Display Categories

async function displayCategories() {
  const newsCategoriesElement = document.querySelector(
    "section#news-categories"
  );
  newsCategoriesElement.innerHTML = "";
  try {
    const categories = await loadCategories();
    categories.forEach((category) => {
      newsCategoriesElement.insertAdjacentHTML(
        "beforeend",
        `
          <div class="border rounded category" data-id="${category["category_id"]}">
            ${category["category_name"]}
          </div>
        `
      );
    });

    // Registering Click Handlers for .category Elements
    registerClickHandlerForCategories();
  } catch (error) {
    newsCategoriesElement.innerHTML = `
            <p class="text-danger fw-bold fs-5 mt-2">Network Error while Loading Categories</p>
        `;
  } finally {
    document.querySelector("#category-spinner").classList.add("d-none");
  }
}

// Invoke Display Categories
displayCategories();

//Handling Click on Categories
function registerClickHandlerForCategories() {
  const categoryElements = Array.from(
    document.querySelectorAll("section#news-categories .category")
  );

  categoryElements.forEach((categoryElement) => {
    categoryElement.addEventListener("click", async function () {
      try {
        newsSpinner.classList.remove("d-none");
        foundNumberAndCategoryElement.classList.add("d-none");
        newsCardsElement.innerHTML = "";

        const categoryID = this.dataset.id;
        arrayOfNews = await fetchData(
          `${allNewsOfACategoryEndpoint}${categoryID}`
        );
        // After Data Received

        foundNumberAndCategoryElement.classList.remove("d-none");
        // Setting Number of Found News in the Selected Category
        numberOfFoundNewsElement.textContent = arrayOfNews.length || "NO";
        foundNewsInCategoryElement.textContent = this.textContent;
        showNewsCards();
      } catch (error) {
        console.log(error);
        newsCardsElement.innerHTML = `
          <p class="text-danger text-center fw-bold fs-4">Network Error while Loading News</p>
        `;
        return;
      } finally {
        newsSpinner.classList.add("d-none");
      }
    });
  });
}

function showNewsCards() {
  arrayOfNews.forEach((news) => {
    newsCardsElement.insertAdjacentHTML(
      "beforeend",
      `
        <div class="news-card bg-white my-3 p-4 row align-items-center" data-id=${
          news["_id"]
        }>
          <div class="col-lg-2">
            <img class="w-100" src=${news["thumbnail_url"]} alt="Thumbnail"/>
          </div>
          <div class="col-lg-10">
            <h5 class="fw-bold">${news["title"]}</h5>
            <p class="text-secondary">
              ${news["details"].replaceAll(/\n/g, "<br/><br/>")}
            </p>
            <div class="row justify-content-between">
              <div class="row">
                
              </div>
              <div>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-eye-fill" viewBox="0 0 16 16">
                  <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z"/>
                  <path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8zm8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z"/>
                </svg>
                <span>${news["total_view"]}</span>
              </div>
            </div>
          </div>
        </div>
      `
    );
  });
}
