const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, "books.json");

app.use(express.json());

// Utility: Read books safely
function readBooks() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, "[]", "utf-8");
    }
    const data = fs.readFileSync(DATA_FILE, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading file:", err);
    return [];
  }
}

// Utility: Write books safely
function writeBooks(books) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(books, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing file:", err);
  }
}

// ✅ GET /books → Return all books
app.get("/books", (req, res) => {
  const books = readBooks();
  res.json(books);
});

// ✅ POST /books → Add a new book
app.post("/books", (req, res) => {
  const { title, author, available } = req.body;
  if (!title || !author || typeof available !== "boolean") {
    return res.status(400).json({ error: "title, author, and available are required." });
  }

  const books = readBooks();
  const newId = books.length ? Math.max(...books.map(b => b.id)) + 1 : 1;
  const newBook = { id: newId, title, author, available };

  books.push(newBook);
  writeBooks(books);
  res.status(201).json(newBook);
});

// ✅ PUT /books/:id → Update book by ID
app.put("/books/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const { title, author, available } = req.body;

  const books = readBooks();
  const bookIndex = books.findIndex(b => b.id === id);

  if (bookIndex === -1) {
    return res.status(404).json({ error: "Book not found." });
  }

  if (title !== undefined) books[bookIndex].title = title;
  if (author !== undefined) books[bookIndex].author = author;
  if (available !== undefined) books[bookIndex].available = available;

  writeBooks(books);
  res.json(books[bookIndex]);
});

// ✅ DELETE /books/:id → Delete book by ID
app.delete("/books/:id", (req, res) => {
  const id = parseInt(req.params.id);
  let books = readBooks();

  const index = books.findIndex(b => b.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Book not found." });
  }

  books.splice(index, 1);
  writeBooks(books);
  res.json({ message: `Book with id ${id} deleted successfully.` });
});

// ⭐ BONUS: GET /books/available → Return only available books
app.get("/books/available", (req, res) => {
  const books = readBooks();
  const availableBooks = books.filter(b => b.available === true);
  res.json(availableBooks);
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
