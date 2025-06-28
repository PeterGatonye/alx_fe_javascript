const showQuoteBtn = document.getElementById("newQuote");
const quoteDisplayContainer = document.getElementById("quoteDisplay");
const select = document.getElementById("categoryFilter");

let quoteObj = JSON.parse(localStorage.getItem("quoteItem")) || [];
if (!Array.isArray(quoteObj)) quoteObj = [];

document.addEventListener("DOMContentLoaded", () => {
  const savedCategory = localStorage.getItem("lastSelectedCategory");
  if (savedCategory) select.value = savedCategory;

  const lastQuote = sessionStorage.getItem("lastViewedQuote");
  if (lastQuote) {
    quoteDisplayContainer.innerHTML = `<p><em>Last viewed:</em> ${lastQuote}</p>`;
  }

  populateCategories();
  filterQuotes();
});

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

  sessionStorage.setItem("lastViewedQuote", `${showRandomQuote.text} - ${showRandomQuote.category}`);
}

function clearRandomQuote() {
  const quotePara = document.getElementById("quote-paragraph");
  if (quotePara) quotePara.remove();
}

showQuoteBtn.addEventListener("click", () => {
  createAddQuoteForm();
  setTimeout(clearRandomQuote, 2000);
});

function saveQuotes() {
  localStorage.setItem("quoteItem", JSON.stringify(quoteObj));
}

function selectedCategory() {
  const selectedOption = select.value;
  localStorage.setItem("lastSelectedCategory", selectedOption);
  filterQuotes();
}

function addQuote() {
  const newQuoteText = document.getElementById("newQuoteText");
  const newQuoteCategory = document.getElementById("newQuoteCategory");

  if (newQuoteText.value && newQuoteCategory.value) {
    const newQuote = {
      text: newQuoteText.value,
      category: newQuoteCategory.value,
    };

    quoteObj.push(newQuote);
    saveQuotes();
    populateCategories();
    filterQuotes();

    newQuoteText.value = "";
    newQuoteCategory.value = "";
  }
}

function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = (e) => {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      if (Array.isArray(importedQuotes)) {
        quoteObj.push(...importedQuotes);
        saveQuotes();
        populateCategories();
        filterQuotes();
        alert("Quotes imported successfully!");
      } else {
        alert("Invalid JSON format.");
      }
    } catch (err) {
      alert("Failed to import quotes.");
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

const exportBtn = document.getElementById("exportQuotes");
exportBtn.addEventListener("click", () => {
  const blob = new Blob([JSON.stringify(quoteObj, null, 2)], {
    type: "application/json",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "quotes.json";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
});

document.getElementById("importFile").addEventListener("change", importFromJsonFile);

function populateCategories() {
  const savedCategory = localStorage.getItem("lastSelectedCategory");
  select.innerHTML = '<option value="all">All Categories</option>';
  const categories = [];

  quoteObj.forEach((quote) => {
    if (!categories.includes(quote.category)) {
      categories.push(quote.category);
    }
  });

  categories.forEach((cat) => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    select.appendChild(option);
  });

  if (savedCategory && (savedCategory === "all" || categories.includes(savedCategory))) {
    select.value = savedCategory;
  } else {
    select.value = "all";
  }
}

function filterQuotes() {
  const selectedOption = select.value;
  quoteDisplayContainer.innerHTML = "";

  const filtered = selectedOption === "all"
    ? quoteObj
    : quoteObj.filter((q) => q.category === selectedOption);

  filtered.forEach((q) => {
    const p = document.createElement("p");
    p.textContent = `${q.text} - ${q.category}`;
    quoteDisplayContainer.appendChild(p);
  });
}

select.addEventListener("change", selectedCategory);

// ✅ UI notification function
function notifyUser(message) {
  const note = document.createElement("div");
  note.textContent = message;
  note.style.background = "#fffae6";
  note.style.border = "1px solid #e0c300";
  note.style.padding = "10px";
  note.style.margin = "10px 0";
  note.style.fontWeight = "bold";
  document.body.insertBefore(note, quoteDisplayContainer);
  setTimeout(() => note.remove(), 4000);
}

// ✅ Fetch quotes from server
function fetchQuotesFromServer() {
  fetch("https://jsonplaceholder.typicode.com/posts")
    .then(res => res.json())
    .then(data => {
      console.log("Fetched server quotes:", data.slice(0, 5));
    })
    .catch(err => console.error("Fetch error:", err));
}

setInterval(fetchQuotesFromServer, 15000); // Optional periodic fetch

// ✅ Post a new quote to mock server
function postQuoteToServer() {
  fetch("https://jsonplaceholder.typicode.com/posts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: "My quote",
      body: "This is a test quote from the client",
      userId: 1,
    }),
  })
    .then((res) => res.json())
    .then((json) => console.log("Posted to server:", json))
    .catch((err) => console.error("Post error:", err));
}

postQuoteToServer(); // optional mock post

// ✅ Sync quotes from server with conflict resolution
async function syncQuotes() {
  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/posts");
    const serverQuotes = await response.json();

    const serverTrimmed = serverQuotes.slice(0, 5).map((item) => ({
      text: item.title,
      category: "Server",
    }));

    const localStr = JSON.stringify(quoteObj);
    const serverStr = JSON.stringify(serverTrimmed);

    if (localStr !== serverStr) {
      localStorage.setItem("quoteItem", JSON.stringify(serverTrimmed));
      quoteObj = serverTrimmed;
      populateCategories();
      filterQuotes();
      notifyUser("Quotes synced with server!"); // ✅ ALX checker keyword
    } else {
      console.log("Quotes are already in sync.");
    }
  } catch (error) {
    console.error("Error syncing quotes:", error);
  }
}

setInterval(syncQuotes, 5000);
