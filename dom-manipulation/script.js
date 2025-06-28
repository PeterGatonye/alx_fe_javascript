document.addEventListener("DOMContentLoaded", function () {
  let savedCategory = localStorage.getItem("lastSelectedCategory");
  if (savedCategory) {
    select.value = savedCategory;
  }

  // Show last viewed quote from sessionStorage
  const lastQuote = sessionStorage.getItem("lastViewedQuote");
  if (lastQuote) {
    quoteDisplayContainer.innerHTML = `<p><em>Last viewed:</em> ${lastQuote}</p>`;
  }

  filterQuotes();
});

const showQuoteBtn = document.getElementById("newQuote");
const quoteDisplayContainer = document.getElementById("quoteDisplay");
const select = document.getElementById("categoryFilter");

// Load or initialize quotes array
let quoteObj = JSON.parse(localStorage.getItem("quoteItem")) || [];
if (!Array.isArray(quoteObj)) {
  quoteObj = [];
}
populateCategories();

// Display a random quote
function createAddQuoteForm() {
  if (quoteObj.length === 0) {
    quoteDisplayContainer.innerHTML = "There are no quotes to display";
    return;
  }

  const randomIndex = Math.floor(Math.random() * quoteObj.length);
  const showRandomQuote = quoteObj[randomIndex];

  quoteDisplayContainer.innerHTML = "";

  const newItem = document.createElement("p");
  newItem.innerHTML = `${showRandomQuote.text} - ${showRandomQuote.category}`;
  newItem.id = "quote-paragraph";
  quoteDisplayContainer.appendChild(newItem);

  // Save to sessionStorage
  sessionStorage.setItem("lastViewedQuote", `${showRandomQuote.text} - ${showRandomQuote.category}`);
}

// Clear the random quote after 2 seconds
function clearRandomQuote() {
  const quotePara = document.getElementById("quote-paragraph");
  if (quotePara) quotePara.remove();
}

showQuoteBtn.addEventListener("click", function () {
  createAddQuoteForm();
  setTimeout(clearRandomQuote, 2000);
});

function saveQuotes() {
  localStorage.setItem("quoteItem", JSON.stringify(quoteObj));
}

function addQuote() {
  const newQuoteText = document.getElementById("newQuoteText");
  const newQuoteCategory = document.getElementById("newQuoteCategory");

  if (newQuoteText.value !== "" && newQuoteCategory.value !== "") {
    const newQuoteObject = {
      text: newQuoteText.value,
      category: newQuoteCategory.value,
    };

    quoteObj.push(newQuoteObject);
    populateCategories();
    filterQuotes();
    saveQuotes();

    newQuoteText.value = "";
    newQuoteCategory.value = "";
  }
}

function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function (event) {
    try {
      const importedQuotes = JSON.parse(event.target.result);
      if (Array.isArray(importedQuotes)) {
        quoteObj.push(...importedQuotes);
        saveQuotes();
        populateCategories();
        filterQuotes();
        alert("Quotes imported successfully!");
      } else {
        alert("Invalid JSON file.");
      }
    } catch (error) {
      alert("Failed to import. Please select a valid JSON file.");
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

const exportBtn = document.getElementById("exportQuotes");
exportBtn.addEventListener("click", function () {
  const filename = "quotes.json";
  const blob = new Blob([JSON.stringify(quoteObj, null, 2)], {
    type: "application/json",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
});

document.getElementById("importFile").addEventListener("change", importFromJsonFile);

function populateCategories() {
  const savedCategory = localStorage.getItem("lastSelectedCategory");
  select.innerHTML = '<option value="all">All Categories</option>';
  const categoriesArr = [];

  quoteObj.forEach((element) => {
    if (!categoriesArr.includes(element.category)) {
      categoriesArr.push(element.category);
    }
  });

  categoriesArr.forEach((optionItem) => {
    const option = document.createElement("option");
    option.value = optionItem;
    option.textContent = optionItem;
    select.appendChild(option);
  });

  if (
    savedCategory &&
    (savedCategory === "all" || categoriesArr.includes(savedCategory))
  ) {
    select.value = savedCategory;
  } else {
    select.value = "all";
  }
}

function filterQuotes() {
  quoteDisplayContainer.innerHTML = "";
  const selectedOption = select.value;

  const filtered = selectedOption === "all"
    ? quoteObj
    : quoteObj.filter((item) => item.category === selectedOption);

  filtered.forEach((element) => {
    const paragraphItem = document.createElement("p");
    paragraphItem.textContent = `${element.text} - ${element.category}`;
    quoteDisplayContainer.appendChild(paragraphItem);
  });
}

function selectedCategory() {
  localStorage.setItem("lastSelectedCategory", select.value);
  filterQuotes();
}

select.addEventListener("change", selectedCategory);

// Simulate server fetch
async function fetchQuotesFromServer() {
  const response = await fetch("https://jsonplaceholder.typicode.com/posts");
  const data = await response.json();
  console.log("Fetched posts from server:", data.slice(0, 5));
}

setInterval(fetchQuotesFromServer, 5000);

// Sync local quotes with mock server data
async function syncQuotes() {
  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/posts");
    const serverQuotes = await response.json();

    const trimmedServerQuotes = serverQuotes.slice(0, 5).map((item) => ({
      text: item.title,
      category: "Server",
    }));

    const localQuotes = JSON.parse(localStorage.getItem("quoteItem")) || [];

    if (JSON.stringify(trimmedServerQuotes) !== JSON.stringify(localQuotes)) {
      console.log("New server quotes found. Syncing now...");
      localStorage.setItem("quoteItem", JSON.stringify(trimmedServerQuotes));
      quoteObj = trimmedServerQuotes;
      populateCategories();
      filterQuotes();
    } else {
      console.log("No changes from server.");
    }
  } catch (error) {
    console.error("Error syncing quotes:", error);
  }
}

setInterval(syncQuotes, 5000);
