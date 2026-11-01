
let chapters = [];
let currentChapter = 0;

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

        const rawHTML = marked.parse(markdown);

        content.innerHTML = DOMPurify.sanitize(rawHTML);

        document.getElementById("chapter-select").value = index;

        document.getElementById("previous-btn").disabled =
            index === 0;

        document.getElementById("next-btn").disabled =
            index === chapters.length - 1;

        document.title = chapter.title + " - A Missed Death Appointment";

        //scroll
        window.scrollTo({
    top: 0,
    behavior: "smooth"
});
    } catch (error) {
        console.error(error);
        content.textContent = "Could not load this chapter.";
    }
}


// Previous 
document.getElementById("previous-btn").addEventListener("click", () => {
    loadChapter(currentChapter - 1);
});


// Next 
document.getElementById("next-btn").addEventListener("click", () => {
    loadChapter(currentChapter + 1);
});
// Disable right-click 
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

initializeWebsite();

