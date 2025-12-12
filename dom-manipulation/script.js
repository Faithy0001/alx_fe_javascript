// API endpoint for simulating server (using JSONPlaceholder as mock)
const SERVER_URL = 'https://jsonplaceholder.typicode.com/posts';

// Load quotes from local storage or use default quotes
let quotes = JSON.parse(localStorage.getItem('quotes')) || [
  { text: "The only way to do great work is to love what you do.", category: "Motivation" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" },
  { text: "Innovation distinguishes between a leader and a follower.", category: "Innovation" },
  { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", category: "Motivation" }
];

// Track last sync time
let lastSyncTime = localStorage.getItem('lastSyncTime') || null;

// Function to save quotes to local storage
function saveQuotes() {
  localStorage.setItem('quotes', JSON.stringify(quotes));
}

// Function to show notification to user
function showNotification(message, type = 'info') {
  const notification = document.getElementById('notification');
  notification.textContent = message;
  notification.className = `notification ${type}`;
  notification.style.display = 'block';
  
  // Auto-hide after 3 seconds
  setTimeout(() => {
    notification.style.display = 'none';
  }, 3000);
}

// Function to fetch quotes from server
async function fetchQuotesFromServer() {
  try {
    showNotification('Syncing with server...', 'info');
    
    const response = await fetch(SERVER_URL);
    const serverPosts = await response.json();
    
    // Transform server data to quote format (simulating server quotes)
    // In real scenario, you'd have a dedicated endpoint for quotes
    const serverQuotes = serverPosts.slice(0, 5).map(post => ({
      text: post.title,
      category: post.userId % 2 === 0 ? "Server" : "Motivation"
    }));
    
    return serverQuotes;
  } catch (error) {
    console.error('Error fetching from server:', error);
    showNotification('Failed to sync with server', 'error');
    return [];
  }
}

// Function to post quotes to server
async function postQuotesToServer(newQuotes) {
  try {
    const response = await fetch(SERVER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        quotes: newQuotes,
        timestamp: new Date().toISOString()
      })
    });
    
    const result = await response.json();
    console.log('Posted to server:', result);
    return true;
  } catch (error) {
    console.error('Error posting to server:', error);
    showNotification('Failed to post to server', 'error');
    return false;
  }
}

// Function to sync quotes with server
async function syncQuotes() {
  const serverQuotes = await fetchQuotesFromServer();
  
  if (serverQuotes.length === 0) {
    return; // No data from server or error occurred
  }
  
  // Conflict resolution: Check for conflicts and merge
  const conflicts = resolveConflicts(serverQuotes);
  
  if (conflicts.added > 0) {
    showNotification(`Synced successfully! Added ${conflicts.added} new quotes from server.`, 'success');
  } else {
    showNotification('Already up to date with server.', 'info');
  }
  
  // Update last sync time
  lastSyncTime = new Date().toISOString();
  localStorage.setItem('lastSyncTime', lastSyncTime);
  
  // Refresh the display
  populateCategories();
  filterQuotes();
}

// Function to resolve conflicts between local and server data
function resolveConflicts(serverQuotes) {
  let addedCount = 0;
  
  // Simple conflict resolution: Server data takes precedence
  // Check for new quotes from server that don't exist locally
  serverQuotes.forEach(serverQuote => {
    const exists = quotes.some(localQuote => 
      localQuote.text === serverQuote.text && 
      localQuote.category === serverQuote.category
    );
    
    if (!exists) {
      quotes.push(serverQuote);
      addedCount++;
    }
  });
  
  // Save updated quotes to local storage
  if (addedCount > 0) {
    saveQuotes();
  }
  
  return { added: addedCount };
}

// Function to manually sync data
async function syncWithServer() {
  await syncQuotes();
}

// Function to populate categories in the dropdown
function populateCategories() {
  const categoryFilter = document.getElementById('categoryFilter');
  
  // Extract unique categories from quotes
  const categories = [...new Set(quotes.map(quote => quote.category))];
  
  // Clear existing options except "All Categories"
  categoryFilter.innerHTML = '<option value="all">All Categories</option>';
  
  // Add each category as an option
  categories.forEach(category => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  });
  
  // Restore last selected filter from local storage
  const lastSelectedCategory = localStorage.getItem('selectedCategory') || 'all';
  categoryFilter.value = lastSelectedCategory;
}

// Function to filter quotes based on selected category
function filterQuotes() {
  const categoryFilter = document.getElementById('categoryFilter');
  const selectedCategory = categoryFilter.value;
  
  // Save selected category to local storage
  localStorage.setItem('selectedCategory', selectedCategory);
  
  // Filter quotes based on selected category
  let filteredQuotes = selectedCategory === 'all' 
    ? quotes 
    : quotes.filter(quote => quote.category === selectedCategory);
  
  // Display a random quote from filtered quotes
  if (filteredQuotes.length > 0) {
    const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
    const randomQuote = filteredQuotes[randomIndex];
    displayQuote(randomQuote);
  } else {
    const quoteDisplay = document.getElementById('quoteDisplay');
    quoteDisplay.innerHTML = '<p>No quotes available for this category.</p>';
  }
}

// Function to display a specific quote
function displayQuote(quote) {
  const quoteDisplay = document.getElementById('quoteDisplay');
  
  // Store last viewed quote in session storage
  sessionStorage.setItem('lastViewedQuote', JSON.stringify(quote));
  
  // Clear previous content
  quoteDisplay.innerHTML = '';
  
  // Create quote text element
  const quoteText = document.createElement('p');
  quoteText.textContent = `"${quote.text}"`;
  quoteText.style.fontSize = '1.2em';
  quoteText.style.fontStyle = 'italic';
  quoteText.style.marginBottom = '10px';
  
  // Create category element
  const quoteCategory = document.createElement('p');
  quoteCategory.textContent = `Category: ${quote.category}`;
  quoteCategory.style.fontWeight = 'bold';
  quoteCategory.style.color = '#666';
  
  // Update the DOM by appending elements
  quoteDisplay.appendChild(quoteText);
  quoteDisplay.appendChild(quoteCategory);
}

// Function to display a random quote
function showRandomQuote() {
  filterQuotes();
}

// The actual function that displays random quotes
function displayRandomQuote() {
  filterQuotes();
}

// Function to add a new quote
async function addQuote() {
  const newQuoteText = document.getElementById('newQuoteText').value;
  const newQuoteCategory = document.getElementById('newQuoteCategory').value;
  
  // Validate input
  if (newQuoteText.trim() === '' || newQuoteCategory.trim() === '') {
    alert('Please enter both quote text and category!');
    return;
  }
  
  // Create new quote object
  const newQuote = {
    text: newQuoteText.trim(),
    category: newQuoteCategory.trim()
  };
  
  // Add new quote to the quotes array
  quotes.push(newQuote);
  
  // Save to local storage
  saveQuotes();
  
  // Post to server
  await postQuotesToServer([newQuote]);
  
  // Update categories dropdown
  populateCategories();
  
  // Clear input fields
  document.getElementById('newQuoteText').value = '';
  document.getElementById('newQuoteCategory').value = '';
  
  // Update the DOM by displaying a quote
  showNotification('Quote added and synced with server!', 'success');
  filterQuotes();
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
  showNotification('Quotes exported successfully!', 'success');
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
      
      // Post imported quotes to server
      postQuotesToServer(importedQuotes);
      
      // Update categories dropdown
      populateCategories();
      
      showNotification(`${importedQuotes.length} quotes imported successfully!`, 'success');
      filterQuotes();
    } catch (error) {
      showNotification('Error parsing JSON file: ' + error.message, 'error');
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

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
  // Populate categories on page load
  populateCategories();
  
  // Display initial quote based on saved filter
  filterQuotes();
  
  // Event listener for the "Show New Quote" button
  document.getElementById('newQuote').addEventListener('click', showRandomQuote);
  
  // Initial sync with server
  syncQuotes();
  
  // Set up periodic syncing (every 30 seconds)
  setInterval(syncQuotes, 30000);
  
  // Display last sync time if available
  if (lastSyncTime) {
    const syncTime = new Date(lastSyncTime).toLocaleString();
    console.log('Last synced:', syncTime);
  }
});

// Show notification about last viewed quote from session storage (optional)
const lastQuote = sessionStorage.getItem('lastViewedQuote');
if (lastQuote) {
  console.log('Last viewed quote:', JSON.parse(lastQuote));
}