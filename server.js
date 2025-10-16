const express = require('express');
const app = express();
app.use(express.json());
let books = [
    { id: 1, title: "Harry Potter", author: "J.K. Rowling", available: true },
    { id: 2, title: "The Alchemist", author: "Paulo Coelho", available: true },
    { id: 3, title: "Atomic Habits", author: "James Clear", available: true }
];
let users = [
    { id: 1, name: "Sravya", subscription: true, borrowedBooks: [] },
    { id: 2, name: "Swetha", subscription: false, borrowedBooks: [] }
];
app.get('/books', (req, res) => {
    res.json(books);
});
app.get('/users', (req, res) => {
    res.json(users);
});
app.put('/users/:id/subscription', (req, res) => {
    const user = users.find(u => u.id == req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.subscription = req.body.subscription;
    res.json({ message: "Subscription updated successfully ", user });
});
app.post('/users/:userId/borrow/:bookId', (req, res) => {
    const user = users.find(u => u.id == req.params.userId);
    const book = books.find(b => b.id == req.params.bookId);

    if (!user || !book)
        return res.status(404).json({ error: "User or Book not found" });

    if (!user.subscription)
        return res.status(403).json({ error: "User does not have an active subscription ❌" });

    if (!book.available)
        return res.status(400).json({ error: "Book is already borrowed ❌" });

    if (user.borrowedBooks.find(b => b.id == book.id))
        return res.status(400).json({ error: "User already borrowed this book ❌" });

    user.borrowedBooks.push(book);
    book.available = false;

    res.json({
        message: `${user.name} borrowed "${book.title}" `,
        borrowedBooks: user.borrowedBooks
    });
});
app.post('/users/:userId/return/:bookId', (req, res) => {
    const user = users.find(u => u.id == req.params.userId);
    const book = books.find(b => b.id == req.params.bookId);
    if (!user || !book)
        return res.status(404).json({ error: "User or Book not found" });

    const wasBorrowed = user.borrowedBooks.some(b => b.id == book.id);
    if (!wasBorrowed)
        return res.status(400).json({ error: "This book was not borrowed by the user ❌" });

    user.borrowedBooks = user.borrowedBooks.filter(b => b.id != book.id);
    book.available = true;

    res.json({
        message: `${user.name} returned "${book.title}" `,
        borrowedBooks: user.borrowedBooks
    });
});
app.get('/', (req, res) => {
    res.json({
        message: " Welcome to the Library Management API!",
        endpoints: {
            books: "/books",
            users: "/users",
            borrowBook: "/users/:userId/borrow/:bookId",
            returnBook: "/users/:userId/return/:bookId",
            updateSubscription: "/users/:id/subscription"
        }
    });
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
