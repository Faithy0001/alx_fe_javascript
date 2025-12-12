// Load quotes from local storage or use default quotes
let quotes = JSON.parse(localStorage.getItem('quotes')) || [
  { text: "The only way to do great work is to love what you do.", category: "Motivation" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" },
  { text: "Innovation distinguishes between a leader and a follower.", category: "Innovation" },
  { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", category: "Motivation" }
];

// Function to save quotes to local storage
function saveQuotes() {
  localStorage.setItem('quotes', JSON.stringify(quotes));
}

// Function to display a random quote
function showRandomQuote() {
  displayRandomQuote();
}

// The actual function that displays random quotes
function displayRandomQuote() {
  const quoteDisplay = document.getElementById('quoteDisplay');

  // Filter quotes by selected category if needed (for future enhancement)
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const randomQuote = quotes[randomIndex];

  // Store last viewed quote in session storage
  sessionStorage.setItem('lastViewedQuote', JSON.stringify(randomQuote));

  // Clear previous content
  quoteDisplay.innerHTML = '';

  // Create quote text element
  const quoteText = document.createElement('p');
  quoteText.textContent = `"${randomQuote.text}"`;
  quoteText.style.fontSize = '1.2em';
  quoteText.style.fontStyle = 'italic';
  quoteText.style.marginBottom = '10px';

  // Create category element
  const quoteCategory = document.createElement('p');
  quoteCategory.textContent = `Category: ${randomQuote.category}`;
  quoteCategory.style.fontWeight = 'bold';
  quoteCategory.style.color = '#666';

  // Update the DOM by appending elements
  quoteDisplay.appendChild(quoteText);
  quoteDisplay.appendChild(quoteCategory);
}

// Function to add a new quote
function addQuote() {
  const newQuoteText = document.getElementById('newQuoteText').value;
  const newQuoteCategory = document.getElementById('newQuoteCategory').value;

  // Validate input
  if (newQuoteText.trim() === '' || newQuoteCategory.trim() === '') {
    alert('Please enter both quote text and category!');
    return;
  }

  // Add new quote to the quotes array
  quotes.push({
    text: newQuoteText.trim(),
    category: newQuoteCategory.trim()
  });

  // Save to local storage
  saveQuotes();

  // Clear input fields
  document.getElementById('newQuoteText').value = '';
  document.getElementById('newQuoteCategory').value = '';

  // Update the DOM by displaying a quote
  alert('Quote added successfully!');
  displayRandomQuote();
}

// Function to export quotes to JSON file
function exportToJsonFile() {
  const dataStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const downloadLink = document.createElement('a');
  downloadLink.href = url;
  downloadLink.download = 'quotes.json';
  downloadLink.click();
  
  URL.revokeObjectURL(url);
}

// Function to import quotes from JSON file
function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function(event) {
    try {
      const importedQuotes = JSON.parse(event.target.result);
      
      // Validate that imported data is an array
      if (!Array.isArray(importedQuotes)) {
        alert('Invalid JSON format. Expected an array of quotes.');
        return;
      }
      
      // Add imported quotes to existing quotes
      quotes.push(...importedQuotes);
      
      // Save to local storage
      saveQuotes();
      
      alert('Quotes imported successfully!');
      displayRandomQuote();
    } catch (error) {
      alert('Error parsing JSON file: ' + error.message);
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

// Function to create add quote form dynamically
function createAddQuoteForm() {
  const formDiv = document.createElement('div');
  formDiv.id = 'addQuoteForm';

  const heading = document.createElement('h2');
  heading.textContent = 'Add Your Own Quote';

  const quoteInput = document.createElement('input');
  quoteInput.id = 'newQuoteText';
  quoteInput.type = 'text';
  quoteInput.placeholder = 'Enter a new quote';

  const categoryInput = document.createElement('input');
  categoryInput.id = 'newQuoteCategory';
  categoryInput.type = 'text';
  categoryInput.placeholder = 'Enter quote category';

  const addButton = document.createElement('button');
  addButton.textContent = 'Add Quote';
  addButton.onclick = addQuote;

  formDiv.appendChild(heading);
  formDiv.appendChild(quoteInput);
  formDiv.appendChild(categoryInput);
  formDiv.appendChild(addButton);

  document.body.appendChild(formDiv);
}

// Event listener for the "Show New Quote" button
document.getElementById('newQuote').addEventListener('click', showRandomQuote);

// Display a random quote when the page loads
displayRandomQuote();

// Show notification about last viewed quote from session storage (optional)
const lastQuote = sessionStorage.getItem('lastViewedQuote');
if (lastQuote) {
  console.log('Last viewed quote:', JSON.parse(lastQuote));
}