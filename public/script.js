
document.addEventListener("DOMContentLoaded", () => {
    initialiseDocumentation();
    initialiseCopyButton();
});

async function initialiseDocumentation() {
    const loadingMessage = document.getElementById("loading-message");
    const errorMessage = document.getElementById("error-message");
    const resourceGroups = document.getElementById("resource-groups");

    try {
        const response = await fetch("/endpoints.json", {
            headers: {
                Accept: "application/json"
            }
        });

        if (!response.ok) {
            throw new Error(
                `Failed to fetch endpoints.json: HTTP ${response.status}`
            );
        }

        const data = await response.json();

        if (
            !data ||
            typeof data !== "object" ||
            Array.isArray(data)
        ) {
            throw new Error(
                "endpoints.json must contain an object keyed by HTTP method and route."
            );
        }

        const endpoints = Object.entries(data)
            .map(([key, details]) => {
                const match = key.match(/^([A-Z]+)\s+(.+)$/i);

                if (!match || !details || typeof details !== "object") {
                    console.warn("Skipping invalid endpoint:", key);
                    return null;
                }

                return {
                    key,
                    method: match[1].toUpperCase(),
                    path: match[2],
                    description:
                        details.description || "No description provided.",
                    exampleRequest: details.exampleRequest,
                    exampleResponse: details.exampleResponse
                };
            })
            .filter(Boolean);

        if (endpoints.length === 0) {
            throw new Error(
                "No valid endpoints found in endpoints.json."
            );
        }

        const groups = groupEndpoints(endpoints);

        renderEndpointGroups(groups, resourceGroups);
        renderNavigation(groups);
        updateStatistics(endpoints, groups);
        populateMethodFilter(endpoints);
        initialiseFilters();

        loadingMessage.hidden = true;
        console.info(
            `CyberHill API docs: loaded ${endpoints.length} endpoints.`
        );
    } catch (error) {
        console.error("CyberHill API documentation error:", error);

        loadingMessage.hidden = true;
        errorMessage.hidden = false;
        errorMessage.textContent =
            `${error.message} Check that public/endpoints.json exists ` +
            "and contains valid JSON.";

        resourceGroups.replaceChildren();
    }
};

/* Group endpoints by the resource named in their route. */
function getResourceName(endpointPath) {
    const path = endpointPath.toLowerCase();

    if (path.includes("/vulnerability-assets")) {
        return "Vulnerability Assets";
    }

    if (path.includes("/vulnerabilities")) {
        return "Vulnerabilities";
    }

    if (path.includes("/relationships")) {
        return "Relationships";
    }

    if (path.includes("/users")) {
        return "Users";
    }

    if (path.includes("/assets")) {
        return "Assets";
    }

    if (path === "/api" || path === "/api/") {
        return "General";
    }

    const segments = endpointPath.split("/").filter(Boolean);
    const resource = segments.length > 1 ? segments[1] : "General";

    return titleCase(resource.replace(/-/g, " "));
}

function groupEndpoints(endpoints) {
    const groups = new Map();

    endpoints.forEach(endpoint => {
        const name = getResourceName(endpoint.path);

        if (!groups.has(name)) {
            groups.set(name, []);
        }

        groups.get(name).push(endpoint);
    });

    return groups;
}

function titleCase(value) {
    return value.replace(/\b\w/g, character => character.toUpperCase());
}

function slugify(value) {
    return value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
}

/* Create a navigation link for every resource group. */
function renderNavigation(groups) {
    const navigation = document.getElementById("resource-navigation");

    navigation.replaceChildren();

    groups.forEach((endpoints, name) => {
        const link = document.createElement("a");

        link.className = "nav-link resource-nav-link";
        link.href = `#${slugify(name)}`;
        link.textContent = name;

        navigation.appendChild(link);
    });
}

/* Update the summary statistics. */
function updateStatistics(endpoints, groups) {
    document.getElementById("endpoint-count").textContent =
        endpoints.length;

    document.getElementById("method-count").textContent =
        new Set(endpoints.map(endpoint => endpoint.method)).size;

    document.getElementById("resource-count").textContent =
        groups.size;
}

/* Populate the HTTP method filter from the JSON data. */
function populateMethodFilter(endpoints) {
    const select = document.getElementById("method-filter");
    const previousValue = select.value || "ALL";

    select.replaceChildren();

    const allOption = document.createElement("option");
    allOption.value = "ALL";
    allOption.textContent = "All methods";
    select.appendChild(allOption);

    const methods = [
        ...new Set(endpoints.map(endpoint => endpoint.method))
    ].sort();

    methods.forEach(method => {
        const option = document.createElement("option");

        option.value = method;
        option.textContent = method;

        select.appendChild(option);
    });

    select.value = methods.includes(previousValue)
        ? previousValue
        : "ALL";
}

/* Render each group and its endpoint cards. */
function renderEndpointGroups(groups, container) {
    container.replaceChildren();

    groups.forEach((endpoints, name) => {
        const section = document.createElement("section");

        section.className = "resource-section";
        section.id = slugify(name);

        const heading = document.createElement("div");
        heading.className = "resource-heading";

        const title = document.createElement("h3");
        title.textContent = name;

        const count = document.createElement("span");
        count.className = "resource-count";
        count.textContent = endpoints.length;

        heading.append(title, count);
        section.appendChild(heading);

        endpoints.forEach(endpoint => {
            section.appendChild(createEndpointCard(endpoint));
        });

        container.appendChild(section);
    });
}

/* Build a single endpoint card. */
function createEndpointCard(endpoint) {
    const card = document.createElement("article");
    card.className = "endpoint-card";

    card.dataset.method = endpoint.method;

    card.dataset.search = [
        endpoint.key,
        endpoint.description,
        JSON.stringify(endpoint.exampleRequest ?? ""),
        JSON.stringify(endpoint.exampleResponse ?? "")
    ].join(" ").toLowerCase();

    const header = document.createElement("div");
    header.className = "endpoint-header";

    const route = document.createElement("div");
    route.className = "endpoint-route";

    const method = document.createElement("span");
    method.className =
        `method-badge method-${getMethodClass(endpoint.method)}`;
    method.textContent = endpoint.method;

    const path = document.createElement("code");
    path.className = "endpoint-path";
    path.textContent = endpoint.path;

    route.append(method, path);

    const toggle = document.createElement("button");
    toggle.className = "endpoint-toggle";
    toggle.type = "button";
    toggle.textContent = "Details";
    toggle.setAttribute("aria-expanded", "false");

    header.append(route, toggle);

    const description = document.createElement("p");
    description.className = "endpoint-description";
    description.textContent = endpoint.description;

    const details = document.createElement("div");
    details.className = "endpoint-details";
    details.hidden = true;

    if (endpoint.exampleRequest !== undefined) {
        details.appendChild(
            createCodeExample("Example request", endpoint.exampleRequest)
        );
    }

    if (endpoint.exampleResponse !== undefined) {
        details.appendChild(
            createCodeExample("Example response", endpoint.exampleResponse)
        );
    }

    if (
        endpoint.exampleRequest === undefined &&
        endpoint.exampleResponse === undefined
    ) {
        const note = document.createElement("p");
        note.className = "endpoint-description";
        note.textContent = "No example request or response has been documented.";
        details.appendChild(note);
    }

    // Only GET routes get a convenient link to open in the browser.
    if (endpoint.method === "GET") {
        const link = document.createElement("a");

        link.className = "endpoint-test-link";
        link.href = endpoint.path.replace(
            /:([a-zA-Z_][a-zA-Z0-9_]*)/g,
            "1"
        );
        link.textContent = "Open endpoint";
        link.target = "_blank";
        link.rel = "noopener noreferrer";

        details.appendChild(link);
    }

    toggle.addEventListener("click", () => {
        const isOpening = details.hidden;

        details.hidden = !isOpening;
        toggle.textContent = isOpening ? "Hide details" : "Details";
        toggle.setAttribute("aria-expanded", String(isOpening));
    });

    card.append(header, description, details);

    return card;
}

function getMethodClass(method) {
    const supportedMethods = [
        "GET",
        "POST",
        "PATCH",
        "PUT",
        "DELETE",
        "OPTIONS",
        "HEAD"
    ];

    return supportedMethods.includes(method) ? method.toLowerCase() : "default";
}

/* Display request and response examples as formatted JSON. */
function createCodeExample(titleText, value) {
    const wrapper = document.createElement("div");
    wrapper.className = "code-example";

    const heading = document.createElement("h4");
    heading.textContent = titleText;

    const pre = document.createElement("pre");
    const code = document.createElement("code");

    code.textContent = JSON.stringify(value, null, 2);

    pre.appendChild(code);
    wrapper.append(heading, pre);

    return wrapper;
}

/* Search and filter the rendered endpoint cards. */
function initialiseFilters() {
    const searchInput = document.getElementById("endpoint-search");
    const methodFilter = document.getElementById("method-filter");
    const visibleCount = document.getElementById("visible-count");
    const noResults = document.getElementById("no-results");
    const resourceGroups = document.getElementById("resource-groups");

    function applyFilters() {
        const query = searchInput.value.trim().toLowerCase();
        const selectedMethod = methodFilter.value;
        let visible = 0;

        resourceGroups.querySelectorAll(".endpoint-card").forEach(card => {
            const matchesSearch = card.dataset.search.includes(query);
            const matchesMethod =
                selectedMethod === "ALL" ||
                card.dataset.method === selectedMethod;

            const shouldShow = matchesSearch && matchesMethod;

            card.hidden = !shouldShow;

            if (shouldShow) {
                visible++;
            }
        });

        resourceGroups.querySelectorAll(".resource-section").forEach(section => {
            const hasVisibleCard = Array.from(
                section.querySelectorAll(".endpoint-card")
            ).some(card => !card.hidden);

            section.hidden = !hasVisibleCard;
        });

        visibleCount.textContent =
            `${visible} endpoint${visible === 1 ? "" : "s"}`;

        noResults.hidden = visible !== 0;
    }

    searchInput.addEventListener("input", applyFilters);
    methodFilter.addEventListener("change", applyFilters);

    applyFilters();
}

/* Copy the API base path. */
function initialiseCopyButton() {
    const button = document.getElementById("copy-base-url");
    const baseUrl = document.getElementById("base-url");

    button.addEventListener("click", async () => {
        const originalText = button.textContent;

        try {
            await navigator.clipboard.writeText(baseUrl.textContent.trim());
            button.textContent = "Copied!";
        } catch (error) {
            console.error("Could not copy the base path:", error);
            button.textContent = "Copy failed";
        }

        window.setTimeout(() => {
            button.textContent = originalText;
        }, 1500);
    });
}
