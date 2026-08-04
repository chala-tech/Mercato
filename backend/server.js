const express = require('express');
const app = express();

const products = [
  { id: 1, name: "Habesha kemis", price: 4999, category: "fashion" },
  { id: 2, name: "Masinko", price: 2499, category: "music" },
  { id: 3, name: "Doro wat", price: 899, category: "food" },
  { id: 4, name: "Ethiopian Coffee Beans", price: 1000, category: "coffee" },
  { id: 5, name: "Traditional Home Decor", price: 6200, category: "art" },
  { id: 6, name: "Anbessa Chema", price: 3000, category: "shoes" },
  { id: 7, name: "Rubik's Cube", price: 600, category: "art" }
];

app.get('/api/products', (req, res) => {
  res.send(products);
});

app.listen(5000, () => console.log('server is running on port 5000'));