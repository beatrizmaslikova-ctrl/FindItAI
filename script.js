
const defaultItems = [
    {
        title: "Wireless Headphones",
        category: "Electronics",
        type: "Lost",
        location: "Library",
        date: "October 20, 2026",
        description: "Black wireless headphones in a small case.",
        color: "Black",
        icon: "🎧"
    },
    {
        title: "Blue Backpack",
        category: "Bags",
        type: "Found",
        location: "Student Lounge",
        date: "October 21, 2026",
        description: "Blue backpack with notebooks inside.",
        color: "Blue",
        icon: "🎒"
    },
    {
        title: "Silver Necklace",
        category: "Accessories",
        type: "Lost",
        location: "Cafeteria",
        date: "October 19, 2026",
        description: "A small silver necklace with a heart pendant.",
        color: "Silver",
        icon: "📿"
    },
    {
        title: "White Water Bottle",
        category: "Other",
        type: "Found",
        location: "Main Building",
        date: "October 22, 2026",
        description: "Reusable white water bottle left on a table.",
        color: "White",
        icon: "🥤"
    },
    {
        title: "Black Headphones",
        category: "Electronics",
        type: "Found",
        location: "Library",
        date: "October 25, 2026",
        description: "Black wireless headphones found in the library.",
        color: "Black",
        icon: "🎧"
    }
];

// LOAD SAVED LISTINGS

let items;

try {
    const savedItems = localStorage.getItem("findItItems");
    items = savedItems ? JSON.parse(savedItems) : defaultItems;
} catch (error) {
    items = defaultItems;
}

const itemsGrid = document.getElementById("itemsGrid");
const searchInput = document.getElementById("searchInput");
const searchButton = document.getElementById("searchButton");
const categoryFilter = document.getElementById("categoryFilter");
const emptyMessage = document.getElementById("emptyMessage");

const listingForm = document.getElementById("listingForm");
const formMessage = document.getElementById("formMessage");

const itemImage = document.getElementById("itemImage");
const imagePreview = document.getElementById("imagePreview");
const imagePreviewContainer = document.getElementById("imagePreviewContainer");


// IMAGE COMPRESSION

function compressImage(file) {
    return new Promise((resolve, reject) => {
        if (!file) {
            resolve("");
            return;
        }

        if (!file.type.startsWith("image/")) {
            reject(new Error("Please select an image."));
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            reject(new Error("Image must be smaller than 5 MB."));
            return;
        }

        const reader = new FileReader();

        reader.onload = function (event) {
            const image = new Image();

            image.onload = function () {
                const canvas = document.createElement("canvas");
                const maxSize = 900;

                let width = image.width;
                let height = image.height;

                if (width > maxSize || height > maxSize) {
                    const ratio = Math.min(
                        maxSize / width,
                        maxSize / height
                    );

                    width = Math.round(width * ratio);
                    height = Math.round(height * ratio);
                }

                canvas.width = width;
                canvas.height = height;

                const context = canvas.getContext("2d");

                context.drawImage(image, 0, 0, width, height);

                resolve(canvas.toDataURL("image/jpeg", 0.75));
            };

            image.onerror = () => reject(
                new Error("Could not read this image.")
            );

            image.src = event.target.result;
        };

        reader.onerror = () => reject(
            new Error("Could not upload this image.")
        );

        reader.readAsDataURL(file);
    });
}


// IMAGE PREVIEW

itemImage.addEventListener("change", async function () {
    const file = itemImage.files[0];

    if (!file) {
        imagePreview.src = "";
        imagePreviewContainer.style.display = "none";
        return;
    }

    try {
        const compressedImage = await compressImage(file);

        imagePreview.src = compressedImage;
        imagePreviewContainer.style.display = "block";
    } catch (error) {
        formMessage.textContent = error.message;
        itemImage.value = "";
        imagePreviewContainer.style.display = "none";
    }
});


// DISPLAY LISTINGS

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

        // Show uploaded photo or default icon
        if (item.image) {
            const photo = document.createElement("img");
            photo.className = "item-photo";
            photo.src = item.image;
            photo.alt = item.title;
            card.appendChild(photo);
        } else {
            const icon = document.createElement("div");
            icon.className = "item-icon";
            icon.textContent = item.icon || "📦";
            card.appendChild(icon);
        }

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

        details.append(location, date);

        const category = document.createElement("span");
        category.className = "item-category";
        category.textContent = item.category;

        const color = document.createElement("span");
        color.className = "item-color";
        color.textContent = `Colour: ${item.color || "Unknown"}`;

        // POSSIBLE MATCHES

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

                const matchScore = document.createElement("div");
                matchScore.className = "match-score";
                matchScore.textContent = `${match.score}% match`;

                const scoreBar = document.createElement("div");
                scoreBar.className = "match-score-bar";

                const scoreFill = document.createElement("div");
                scoreFill.className = "match-score-fill";
                scoreFill.style.width = `${match.score}%`;

                scoreBar.appendChild(scoreFill);

                const matchInfo = document.createElement("p");
                matchInfo.textContent =
                    `${match.item.type} · ${match.item.location}`;

                const matchReason = document.createElement("small");
                matchReason.textContent = match.reasons.length > 0
                    ? `Why it matches: ${match.reasons.join(" · ")}`
                    : "Some details are similar";

                matchCard.append(
                    matchName,
                    matchScore,
                    scoreBar,
                    matchInfo,
                    matchReason
                );

                matchSection.appendChild(matchCard);
            });
        }

        card.append(
            status,
            title,
            description,
            details,
            category,
            color,
            matchSection
        );

        itemsGrid.appendChild(card);
    });
}


// SEARCH AND FILTER

function filterItems() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    const selectedCategory = categoryFilter.value;

    const filteredItems = items.filter(item => {
        const searchableText = [
            item.title,
            item.description,
            item.location,
            item.category,
            item.type,
            item.color
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


// CREATE NEW LISTING

listingForm.addEventListener("submit", async function(event) {
    event.preventDefault();

    const title = document.getElementById("itemTitle").value.trim();
    const type = document.getElementById("itemType").value;
    const category = document.getElementById("itemCategory").value;
    const location = document.getElementById("itemLocation").value.trim();
    const color = document.getElementById("itemColor").value;
    const description = document.getElementById("itemDescription").value.trim();

    if (!title || !location || !description || !color) {
        formMessage.textContent = "Please fill in all required fields.";
        return;
    }

    const submitButton = listingForm.querySelector('button[type="submit"]');

    submitButton.disabled = true;
    submitButton.textContent = "Publishing...";

    try {
        const file = itemImage.files[0];
        const image = file ? await compressImage(file) : "";

        const newItem = {
            title,
            category,
            type,
            location,
            color,
            date: new Date().toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric"
            }),
            description,
            image,
            icon: category === "Electronics" ? "🎧" :
                  category === "Bags" ? "🎒" :
                  category === "Accessories" ? "👜" : "📦"
        };

        const updatedItems = [newItem, ...items];

        // Save listings and photos
        localStorage.setItem(
            "findItItems",
            JSON.stringify(updatedItems)
        );

        items = updatedItems;

        // Clear the complete form
        listingForm.reset();

        imagePreview.src = "";
        imagePreviewContainer.style.display = "none";

        formMessage.textContent = "Your listing has been published!";

        filterItems();

        // Scroll to the new listing
        document.getElementById("items").scrollIntoView({
            behavior: "smooth"
        });

    } catch (error) {
        console.error(error);

        formMessage.textContent =
            "Could not save the listing. Try a smaller photo.";

    } finally {
        submitButton.disabled = false;
        submitButton.textContent = "Publish listing";
    }
});


// AI MATCHING ALGORITHM

function findMatches(item) {
    const oppositeType = item.type === "Lost" ? "Found" : "Lost";

    const stopWords = [
        "the", "a", "an", "in", "at", "on", "of",
        "and", "with", "my", "is", "to", "left",
        "found", "lost", "item", "small", "near",
        "this", "that", "was", "were", "for"
    ];

    const synonymGroups = [
        ["headphones", "headphone", "headset", "earphones", "earbuds", "airpods"],
        ["phone", "smartphone", "mobile", "iphone", "cellphone"],
        ["backpack", "rucksack"],
        ["bag", "handbag", "tote"],
        ["bottle", "flask"],
        ["necklace", "pendant"],
        ["earring", "earrings", "stud", "studs", "hoop", "hoops"]
    ];

    function normalize(text) {
        return String(text || "")
            .toLowerCase()
            .replace(/[^a-z0-9\s]/g, " ")
            .trim();
    }

    function getWords(text) {
        return normalize(text)
            .split(/\s+/)
            .filter(word =>
                word.length > 2 && !stopWords.includes(word)
            );
    }

    function getCanonicalWord(word) {
        const group = synonymGroups.find(words =>
            words.includes(word)
        );

        return group ? group[0] : word;
    }

    function getItemWords(currentItem) {
        return getWords(
            `${currentItem.title} ${currentItem.description}`
        ).map(getCanonicalWord);
    }

    function getItemType(currentItem) {
        const words = getItemWords(currentItem);

        for (const group of synonymGroups) {
            const canonical = group[0];

            if (words.includes(canonical)) {
                return canonical;
            }
        }

        return null;
    }

    function getColor(currentItem) {
        if (currentItem.color &&
            currentItem.color.toLowerCase() !== "unknown") {
            return normalize(currentItem.color);
        }

        const colors = [
            "black", "white", "red", "blue", "green",
            "yellow", "pink", "purple", "silver",
            "gold", "grey", "gray", "brown", "orange"
        ];

        const text = normalize(
            `${currentItem.title} ${currentItem.description}`
        );

        return colors.find(color =>
            text.split(/\s+/).includes(color)
        ) || null;
    }

    const currentType = getItemType(item);
    const currentColor = getColor(item);
    const currentWords = getItemWords(item);
    const currentLocation = normalize(item.location);

    return items
        .filter(otherItem =>
            otherItem !== item &&
            otherItem.type === oppositeType &&
            otherItem.category === item.category
        )
        .map(otherItem => {
            const otherType = getItemType(otherItem);
            const otherColor = getColor(otherItem);
            const otherWords = getItemWords(otherItem);

            if (
                currentType &&
                otherType &&
                currentType !== otherType
            ) {
                return null;
            }

            const sharedWords = [
                ...new Set(
                    currentWords.filter(word =>
                        otherWords.includes(word)
                    )
                )
            ];

            const sameType =
                currentType !== null &&
                currentType === otherType;

            if (!sameType && sharedWords.length === 0) {
                return null;
            }

            const sameColor =
                currentColor !== null &&
                otherColor !== null &&
                currentColor === otherColor;

            const differentColors =
                currentColor !== null &&
                otherColor !== null &&
                currentColor !== otherColor;

            const sameLocation =
                currentLocation !== "" &&
                currentLocation === normalize(otherItem.location);

            const reasons = [];
            let score = 0;

            if (sameType) {
                score += 40;
                reasons.push("Same item type");
            }

            if (sharedWords.length > 0) {
                score += Math.min(sharedWords.length * 8, 24);
                reasons.push("Similar descriptions");
            }

            if (sameColor) {
                score += 25;
                reasons.push("Same colour");
            }

            if (sameLocation) {
                score += 15;
                reasons.push("Same location");
            }

            if (differentColors) {
                score -= 35;
            }

            score = Math.max(0, Math.min(score, 100));

            return {
                item: otherItem,
                score,
                sharedWords,
                reasons,
                differentColors
            };
        })
        .filter(match =>
            match !== null && match.score >= 40
        )
        .sort((a, b) => b.score - a.score);
}


// DISPLAY LISTINGS WHEN PAGE LOADS

renderItems(items);
