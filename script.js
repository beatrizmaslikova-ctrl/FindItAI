
const items = [
    {
        title: "Wireless Headphones",
        category: "Electronics",
        type: "Lost",
        location: "Library",
        date: "October 20, 2026",
        description: "Black wireless headphones in a small case.",
        icon: "🎧"
    },
    {
        title: "Blue Backpack",
        category: "Bags",
        type: "Found",
        location: "Student Lounge",
        date: "October 21, 2026",
        description: "Blue backpack with notebooks inside.",
        icon: "🎒"
    },
    {
        title: "Silver Necklace",
        category: "Accessories",
        type: "Lost",
        location: "Cafeteria",
        date: "October 19, 2026",
        description: "A small silver necklace with a heart pendant.",
        icon: "📿"
    },
    {
        title: "White Water Bottle",
        category: "Other",
        type: "Found",
        location: "Main Building",
        date: "October 22, 2026",
        description: "Reusable white water bottle left on a table.",
        icon: "🥤"
    }
];

const itemsGrid = document.getElementById("itemsGrid");

function renderItems() {
    itemsGrid.innerHTML = "";

    items.forEach(item => {
        const card = document.createElement("article");
        card.className = "item-card";

        card.innerHTML = `
            <div class="item-icon">${item.icon}</div>
            <span class="item-status ${item.type.toLowerCase()}">
                ${item.type}
            </span>
            <h3>${item.title}</h3>
            <p>${item.description}</p>
            <div class="item-details">
                <span>📍 ${item.location}</span>
                <span>📅 ${item.date}</span>
            </div>
            <span class="item-category">${item.category}</span>
        `;

        itemsGrid.appendChild(card);
    });
}

renderItems();
