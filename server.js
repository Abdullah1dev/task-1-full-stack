
const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static("public"));

const foodFile = path.join(__dirname, "data", "food.json");
const ordersFile = path.join(__dirname, "data", "orders.json");

// API 1: Get all food items
app.get("/food", (req, res) => {
    const food = JSON.parse(fs.readFileSync(foodFile, "utf8"));
    res.json(food);
});

// API 2: Place an order
app.post("/orders", (req, res) => {
    const { name, phone, address, items } = req.body;

    if (!name || !phone || !address || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ message: "Invalid order details" });
    }

    const food = JSON.parse(fs.readFileSync(foodFile, "utf8"));
    const orders = JSON.parse(fs.readFileSync(ordersFile, "utf8"));

    const orderedItems = [];

    for (const item of items) {
        const foodItem = food.find(f => f.id === Number(item.id));
        const quantity = Number(item.quantity);

        if (!foodItem || !Number.isInteger(quantity) || quantity < 1) {
            return res.status(400).json({ message: "Invalid food item or quantity" });
        }

        orderedItems.push({
            id: foodItem.id,
            name: foodItem.name,
            price: foodItem.price,
            quantity: quantity
        });
    }

    const total = orderedItems.reduce(
        (sum, item) => sum + item.price * item.quantity, 0
    );

    const newOrder = {
        id: Date.now(),
        name,
        phone,
        address,
        items: orderedItems,
        total,
        date: new Date().toLocaleString()
    };

    orders.push(newOrder);

    fs.writeFileSync(ordersFile, JSON.stringify(orders, null, 2));

    res.status(201).json({
        message: "Order placed successfully!",
        order: newOrder
    });
});

// API 3: Get all orders
app.get("/orders", (req, res) => {
    const orders = JSON.parse(fs.readFileSync(ordersFile, "utf8"));
    res.json(orders);
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
