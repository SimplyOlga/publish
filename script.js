
let chapters = [];
let currentChapter = 0;

// Load chapter list
async function initializeWebsite() {
    try {
        const response = await fetch("chapters.json");

        if (!response.ok) {
            throw new Error("Could not load chapter list");
        }

        chapters = await response.json();

        const selector = document.getElementById("chapter-select");

        chapters.forEach((chapter, index) => {
            const option = document.createElement("option");

            option.value = index;
            option.textContent = chapter.title;

            selector.appendChild(option);
        });

        selector.addEventListener("change", () => {
            if (selector.value !== "") {
                loadChapter(Number(selector.value));
            }
        });

        if (chapters.length > 0) {
            loadChapter(0);
        }

    } catch (error) {
        console.error(error);
        document.getElementById("chapter-content").textContent =
            "Could not load the chapters.";
    }
}


// Load an individual chapter
async function loadChapter(index) {
    if (index < 0 || index >= chapters.length) return;

    currentChapter = index;

    const chapter = chapters[index];

    document.getElementById("chapter-number").textContent =
        `CHAPTER ${String(index + 1).padStart(2, "0")}`;

    

    const content = document.getElementById("chapter-content");

    content.textContent = "Loading...";

    try {
        const response = await fetch(chapter.file);

        if (!response.ok) {
            throw new Error("Chapter file not found");
        }

        const markdown = await response.text();

        // Convert Markdown into HTML
        const rawHTML = marked.parse(markdown);

        // Sanitize generated HTML
        content.innerHTML = DOMPurify.sanitize(rawHTML);

        // Update chapter selector
        document.getElementById("chapter-select").value = index;

        // Update navigation buttons
        document.getElementById("previous-btn").disabled =
            index === 0;

        document.getElementById("next-btn").disabled =
            index === chapters.length - 1;

        // Update browser tab title
        document.title = chapter.title + " - A Missed Death Appointment";

        // Start each chapter at the top
        window.scrollTo({
    top: 0,
    behavior: "smooth"
});
    } catch (error) {
        console.error(error);
        content.textContent = "Could not load this chapter.";
    }
}


// Previous chapter
document.getElementById("previous-btn").addEventListener("click", () => {
    loadChapter(currentChapter - 1);
});


// Next chapter
document.getElementById("next-btn").addEventListener("click", () => {
    loadChapter(currentChapter + 1);
});
// Disable right-click inside chapter content
document.addEventListener("contextmenu", function(event) {
    if (event.target.closest(".markdown-content")) {
        event.preventDefault();
    }
});

document.addEventListener("keydown", function(event) {

    const content = document.querySelector(".markdown-content");

    if (!content) return;

    if (
        event.target.closest(".markdown-content") &&
        (event.ctrlKey || event.metaKey) &&
        ["c", "a", "x", "s", "u"].includes(event.key.toLowerCase())
    ) {
        event.preventDefault();
    }

});

// Start website
initializeWebsite();

