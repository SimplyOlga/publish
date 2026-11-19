
let chapters = [];
let currentChapter = 0;

const BOOKMARK_KEY = "missedDeathAppointment_bookmark";


// ==========================================
// INITIALIZE WEBSITE
// ==========================================

async function initializeWebsite() {
    try {
        const response = await fetch("underchapters.json");

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

        // Restore existing bookmark
        if (chapters.length > 0) {

            const bookmark = getBookmark();

            if (
                bookmark &&
                Number.isInteger(bookmark.chapter) &&
                bookmark.chapter >= 0 &&
                bookmark.chapter < chapters.length
            ) {
                loadChapter(
                    bookmark.chapter,
                    bookmark.scrollPosition
                );
            } else {
                loadChapter(0);
            }
        }

    } catch (error) {
        console.error(error);

        document.getElementById("chapter-content").textContent =
            "Could not load the chapters.";
    }
}


// ==========================================
// LOAD CHAPTER
// ==========================================

async function loadChapter(index, restorePosition = null) {

    if (index < 0 || index >= chapters.length) return;

    currentChapter = index;

    const chapter = chapters[index];

    document.getElementById("chapter-number").textContent =
        `CHAPTER ${String(index + 1).padStart(2, "0")}`;

    const content = document.getElementById("chapter-content");

    content.textContent = "Loading...";

    try {
        const response = await fetch(`underchapters/${chapter.file}`);

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

        // Wait for rendered content before scrolling
        requestAnimationFrame(() => {

            if (restorePosition !== null) {

                window.scrollTo({
                    top: Math.max(0, restorePosition),
                    behavior: "instant"
                });

            } else {

                window.scrollTo({
                    top: 0,
                    behavior: "smooth"
                });

            }

            // Restore saved bookmark marker
            restoreSavedBookmark();

        });

    } catch (error) {
        console.error(error);
        content.textContent = "Could not load this chapter.";
    }
}


// ==========================================
// SAVE BOOKMARK
// ==========================================

function saveBookmark() {

    const bookmark = {
        chapter: currentChapter,
        scrollPosition: window.scrollY,

        // Save exact vertical screen position
        markerPosition: window.scrollY + window.innerHeight / 2,

        timestamp: Date.now()
    };

    try {
        localStorage.setItem(
            BOOKMARK_KEY,
            JSON.stringify(bookmark)
        );

        // Remove previous marker
        const oldMarker = document.querySelector(".saved-bookmark");

        if (oldMarker) {
            oldMarker.remove();
        }

        // Create new marker
        renderSavedBookmark(bookmark);

    } catch (error) {
        console.error("Could not save bookmark:", error);
    }
}



// ==========================================
// GET SAVED BOOKMARK
// ==========================================

function getBookmark() {

    try {

        const saved = localStorage.getItem(BOOKMARK_KEY);

        if (!saved) return null;

        const bookmark = JSON.parse(saved);

        if (
            !Number.isInteger(bookmark.chapter) ||
            !Number.isFinite(bookmark.scrollPosition) ||
            !Number.isFinite(bookmark.markerPosition)
        ) {
            return null;
        }

        return bookmark;

    } catch (error) {

        console.error("Could not retrieve bookmark:", error);

        return null;

    }
}


// ==========================================
// DISPLAY SAVED BOOKMARK MARKER
// ==========================================

function renderSavedBookmark(bookmark) {

    if (!bookmark) return;

    const marker = document.createElement("img");

    marker.src = "assets/bookmark.png";
    marker.className = "saved-bookmark";
    marker.alt = "";

    marker.style.top = bookmark.markerPosition + "px";

    document.body.appendChild(marker);
}


// ==========================================
// RESTORE SAVED BOOKMARK
// ==========================================

function restoreSavedBookmark() {

    const bookmark = getBookmark();

    if (bookmark) {
        renderSavedBookmark(bookmark);
    }
}


// ==========================================
// BOOKMARK BUTTON
// ==========================================

document.getElementById("bookmark-btn").addEventListener("click", () => {

    saveBookmark();

});


// ==========================================
// PREVIOUS CHAPTER
// ==========================================

document.getElementById("previous-btn").addEventListener("click", () => {

    loadChapter(currentChapter - 1);

});


// ==========================================
// NEXT CHAPTER
// ==========================================

document.getElementById("next-btn").addEventListener("click", () => {

    loadChapter(currentChapter + 1);

});


// ==========================================
// DISABLE RIGHT-CLICK
// ==========================================

document.addEventListener("contextmenu", function(event) {

    if (event.target.closest(".markdown-content")) {
        event.preventDefault();
    }

});


// ==========================================
// DISABLE SELECTED KEYBOARD SHORTCUTS
// ==========================================

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


// ==========================================
// START WEBSITE
// ==========================================

initializeWebsite();
