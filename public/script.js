
let foodItems = [];
let cart = [];

// Load food from backend
async function loadFood() {
    const response = await fetch("/food");
    foodItems = await response.json();

    const foodList = document.getElementById("food-list");

    foodList.innerHTML = foodItems.map(food => `
        <div class="col-md-3 col-sm-6 mb-4">
            <div class="card food-card shadow-sm">
                <div class="card-body">
                    <h5>${food.name}</h5>
                    <p>Category: ${food.category}</p>
                    <p>Price: Rs. ${food.price}</p>
                    <button class="btn btn-warning"
                        onclick="addToCart(${food.id})">
                        Add to Cart
                    </button>
                </div>
            </div>
        </div>
    `).join("");
}

// Add food to cart
function addToCart(id) {
    const existingItem = cart.find(item => item.id === id);

    if (existingItem) {
        existingItem.quantity++;
    } else {
        const food = foodItems.find(item => item.id === id);
        cart.push({ ...food, quantity: 1 });
    }

    displayCart();
}

// Remove food from cart
function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    displayCart();
}

// Display cart and calculate bill
function displayCart() {
    const cartItems = document.getElementById("cart-items");

    cartItems.innerHTML = cart.map(item => `
        <div class="d-flex justify-content-between border-bottom py-2">
            <span>${item.name} x ${item.quantity}</span>

            <span>
                Rs. ${item.price * item.quantity}

                <button class="btn btn-sm btn-danger ms-2"
                    onclick="removeFromCart(${item.id})">
                    Remove
                </button>
            </span>
        </div>
    `).join("");

    const total = cart.reduce(
        (sum, item) => sum + item.price * item.quantity, 0
    );

    document.getElementById("total").textContent = total;
}

// Place order
document.getElementById("order-form").addEventListener("submit",
    async function(event) {

    event.preventDefault();

    if (cart.length === 0) {
        alert("Please add food items to your cart!");
        return;
    }

    const name = document.getElementById("name").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const address = document.getElementById("address").value.trim();

    if (!name || !phone || !address) {
        alert("Please fill all customer details!");
        return;
    }

    const orderData = {
        name,
        phone,
        address,
        items: cart.map(item => ({
            id: item.id,
            quantity: item.quantity
        }))
    };

    try {
        const response = await fetch("/orders", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(orderData)
        });

        const result = await response.json();

        if (!response.ok) {
            alert(result.message);
            return;
        }

        document.getElementById("message").innerHTML =
            `<div class="alert alert-success">
                ${result.message}
                Order ID: ${result.order.id}
            </div>`;

        cart = [];
        displayCart();
        document.getElementById("order-form").reset();

    } catch (error) {
        alert("Unable to place order!");
    }
});

// Start website
loadFood();
