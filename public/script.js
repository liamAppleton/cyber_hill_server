
const searchInput = document.querySelector("#endpoint-search");
const endpointCards = [...document.querySelectorAll(".endpoint-card")];
const resourceGroups = [...document.querySelectorAll(".resource-group")];
const noResults = document.querySelector("#no-results");
const endpointCount = document.querySelector("#endpoint-count");

endpointCount.textContent = endpointCards.length;

// Filter endpoints by method, path or description.
searchInput.addEventListener("input", () => {
    const query = searchInput.value.trim().toLowerCase();
    let visibleCount = 0;

    endpointCards.forEach((card) => {
        const searchableText = [
            card.dataset.method,
            card.dataset.path,
            card.dataset.description,
            card.textContent
        ].join(" ").toLowerCase();

        const matches = searchableText.includes(query);

        card.hidden = !matches;

        if (matches) {
            visibleCount++;
        }
    });

    resourceGroups.forEach((group) => {
        const visibleCards = group.querySelectorAll(
            ".endpoint-card:not([hidden])"
        );

        group.hidden = visibleCards.length === 0;
    });

    noResults.hidden = visibleCount !== 0;
});

// Expand or collapse endpoint details by clicking a row.
endpointCards.forEach((card) => {
    const summary = card.querySelector(".endpoint-summary");

    summary.setAttribute("role", "button");
    summary.setAttribute("tabindex", "0");
    summary.setAttribute("aria-expanded", "false");

    const toggleDetails = () => {
        const expanded = card.classList.toggle("expanded");
        summary.setAttribute("aria-expanded", String(expanded));
    };

    summary.addEventListener("click", toggleDetails);

    summary.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            toggleDetails();
        }
    });
});

// Press "/" to jump straight to endpoint search.
document.addEventListener("keydown", (event) => {
    const activeTag = document.activeElement.tagName;
    const isTyping = ["INPUT", "TEXTAREA", "SELECT"].includes(activeTag);

    if (event.key === "/" && !isTyping) {
        event.preventDefault();
        searchInput.focus();
    }

    if (event.key === "Escape" && document.activeElement === searchInput) {
        searchInput.value = "";
        searchInput.dispatchEvent(new Event("input"));
        searchInput.blur();
    }
});
