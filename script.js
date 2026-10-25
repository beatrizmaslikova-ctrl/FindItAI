

const defaultItems = [
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
    },
    {

    title: "Black Headphones",
    category: "Electronics",
    type: "Found",
    location: "Library",
    date: "October 25, 2026",
    description: "Black wireless headphones found in the library.",
    icon: "🎧"
},
];

let items = JSON.parse(localStorage.getItem("findItItems")) || defaultItems;

const itemsGrid = document.getElementById("itemsGrid");
const searchInput = document.getElementById("searchInput");
const searchButton = document.getElementById("searchButton");
const categoryFilter = document.getElementById("categoryFilter");
const emptyMessage = document.getElementById("emptyMessage");
const listingForm = document.getElementById("listingForm");
const formMessage = document.getElementById("formMessage");

function renderItems(itemsToShow) {
    itemsGrid.innerHTML = "";

    if (itemsToShow.length === 0) {
        emptyMessage.style.display = "block";
        return;
    }

    emptyMessage.style.display = "none";

    itemsToShow.forEach(item => {
        const card = document.createElement("article");
        card.className = "item-card";

        const icon = document.createElement("div");
        icon.className = "item-icon";
        icon.textContent = item.icon;

        const status = document.createElement("span");
        status.className = `item-status ${item.type.toLowerCase()}`;
        status.textContent = item.type;

        const title = document.createElement("h3");
        title.textContent = item.title;

        const description = document.createElement("p");
        description.textContent = item.description;

        const details = document.createElement("div");
        details.className = "item-details";

        const location = document.createElement("span");
        location.textContent = `📍 ${item.location}`;

        const date = document.createElement("span");
        date.textContent = `📅 ${item.date}`;

        const category = document.createElement("span");
        category.className = "item-category";
        category.textContent = item.category;

        details.append(location, date);
        
const matches = findMatches(item);

const matchSection = document.createElement("div");
matchSection.className = "match-section";

if (matches.length > 0) {
    const matchTitle = document.createElement("h4");
    matchTitle.textContent = "Possible matches";
    matchSection.appendChild(matchTitle);

    matches.slice(0, 2).forEach(match => {
        const matchCard = document.createElement("div");
        matchCard.className = "match-card";

        const matchName = document.createElement("strong");
        matchName.textContent = match.item.title;

        const matchInfo = document.createElement("p");
        matchInfo.textContent =
            `${match.item.type} · ${match.item.location}`;

        const matchReason = document.createElement("small");
        matchReason.textContent =
            match.sharedWords.length > 0
                ? `Similar words: ${match.sharedWords.join(", ")}`
                : `Similar category or location`;

        matchCard.append(matchName, matchInfo, matchReason);
        matchSection.appendChild(matchCard);
    });
}

card.append(
    icon,
    status,
    title,
    description,
    details,
    category,
    matchSection
);

        itemsGrid.appendChild(card);
    });
}

function filterItems() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    const selectedCategory = categoryFilter.value;

    const filteredItems = items.filter(item => {
        const searchableText = [
            item.title,
            item.description,
            item.location,
            item.category,
            item.type
        ].join(" ").toLowerCase();

        const matchesSearch = searchableText.includes(searchTerm);
        const matchesCategory =
            selectedCategory === "all" ||
            item.category.toLowerCase() === selectedCategory.toLowerCase();

        return matchesSearch && matchesCategory;
    });

    renderItems(filteredItems);
}

searchButton.addEventListener("click", filterItems);
searchInput.addEventListener("input", filterItems);
categoryFilter.addEventListener("change", filterItems);

listingForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const title = document.getElementById("itemTitle").value.trim();
    const type = document.getElementById("itemType").value;
    const category = document.getElementById("itemCategory").value;
    const location = document.getElementById("itemLocation").value.trim();
    const description = document.getElementById("itemDescription").value.trim();

    if (!title || !location || !description) {
        formMessage.textContent = "Please fill in all fields.";
        return;
    }

    const newItem = {
        title,
        category,
        type,
        location,
        date: new Date().toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric"
        }),
        description,
        icon: category === "Electronics" ? "🎧" :
              category === "Bags" ? "🎒" :
              category === "Accessories" ? "👜" : "📦"
    };

    items.unshift(newItem);
    localStorage.setItem("findItItems", JSON.stringify(items));

    listingForm.reset();
    formMessage.textContent = "Your listing has been published!";
    filterItems();
});

renderItems(items);


function findMatches(item) {
    const oppositeType = item.type === "Lost" ? "Found" : "Lost";

    const stopWords = [
        "the", "a", "an", "in", "at", "on", "of",
        "and", "with", "my", "is", "to", "left"
    ];

    function getWords(text) {
        return text
            .toLowerCase()
            .replace(/[^a-z0-9\s]/g, "")
            .split(/\s+/)
            .filter(word =>
                word.length > 2 && !stopWords.includes(word)
            );
    }

    return items
        .filter(otherItem =>
            otherItem !== item &&
            otherItem.type === oppositeType &&
            otherItem.category === item.category
        )
        .map(otherItem => {
            const itemWords = getWords(
                `${item.title} ${item.description}`
            );

            const otherWords = getWords(
                `${otherItem.title} ${otherItem.description}`
            );

            const sharedWords = [
                ...new Set(itemWords.filter(word =>
                    otherWords.includes(word)
                ))
            ];

            return {
                item: otherItem,
                score: sharedWords.length,
                sharedWords
            };
        })
        .filter(match => match.score >= 1)
        .sort((a, b) => b.score - a.score);
}
