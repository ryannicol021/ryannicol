history.scrollRestoration = "manual";
window.scrollTo(0, 0);

const sections = {
    experience: {
        file: "data/experience.csv",
        type: "experience"
    },

    education: {
        file: "data/education.csv",
        type: "education"
    },

    volunteering: {
        file: "data/volunteering.csv",
        type: "experience"
    },

    awards: {
        file: "data/awards.csv",
        type: "award"
    },

    socials: {
        file: "data/socials.csv",
        type: "social"
    }
};


/* --------------------------------
   Bible verses
-------------------------------- */

const bibleVerses = [
    "1 Corinthians 16:13",
    "1 Corinthians 16:14",
    "1 John 4:19",
    "1 Thessalonians 5:17",
    "2 Corinthians 5:7",
    "Colossians 3:14",
    "Galatians 2:20",
    "Galatians 5:14",
    "Galatians 6:2",
    "Isaiah 41:10",
    "John 3:16",
    "John 6:35",
    "John 15:13",
    "Joshua 1:9",
    "Matthew 5:14",
    "Matthew 5:16",
    "Matthew 6:33",
    "Matthew 16:24",
    "Matthew 25:40",
    "Micah 6:8",
    "Philippians 4:13",
    "Proverbs 3:5",
    "Psalm 23:1",
    "Romans 8:31",
    "Romans 12:2",
    "Romans 12:12",
    "Romans 12:21",
    "Romans 13:9",
    "Romans 15:13"
];


function initializeBibleVerse() {
    const verseReference =
        document.querySelector(".bible-verse-reference");

    if (!verseReference || !bibleVerses.length) {
        return;
    }

    const verse =
        bibleVerses[
            Math.floor(Math.random() * bibleVerses.length)
        ];

    verseReference.textContent = verse;
}


/* --------------------------------
   CSV loading
-------------------------------- */

async function loadCSV(file) {
    const response = await fetch(file);

    if (!response.ok) {
        throw new Error(`Could not load ${file}`);
    }

    const text = await response.text();

    return parseCSV(text);
}


function parseCSV(text) {
    const rows = [];
    let row = [];
    let value = "";
    let insideQuotes = false;

    for (let i = 0; i < text.length; i++) {
        const character = text[i];
        const nextCharacter = text[i + 1];

        if (character === '"' && insideQuotes && nextCharacter === '"') {
            value += '"';
            i++;
            continue;
        }

        if (character === '"') {
            insideQuotes = !insideQuotes;
            continue;
        }

        if (character === "," && !insideQuotes) {
            row.push(value.trim());
            value = "";
            continue;
        }

        if ((character === "\n" || character === "\r") && !insideQuotes) {
            if (character === "\r" && nextCharacter === "\n") {
                i++;
            }

            row.push(value.trim());
            value = "";

            if (row.some(cell => cell !== "")) {
                rows.push(row);
            }

            row = [];
            continue;
        }

        value += character;
    }

    if (value !== "" || row.length > 0) {
        row.push(value.trim());

        if (row.some(cell => cell !== "")) {
            rows.push(row);
        }
    }

    if (rows.length === 0) {
        return [];
    }

    const headers = rows[0].map(header =>
        header.trim().toLowerCase()
    );

    return rows.slice(1).map(row => {
        const object = {};

        headers.forEach((header, index) => {
            object[header] = row[index] ?? "";
        });

        return object;
    });
}


/* --------------------------------
   Date formatting
-------------------------------- */

function formatMonthYear(value) {
    if (!value) {
        return "";
    }

    if (value.toLowerCase() === "present") {
        return "Present";
    }

    const match = value.match(/^(\d{4})-(\d{1,2})$/);

    if (!match) {
        return value;
    }

    const year = Number(match[1]);
    const month = Number(match[2]);

    const date = new Date(year, month - 1, 1);

    return new Intl.DateTimeFormat("en-US", {
        month: "long",
        year: "numeric"
    }).format(date);
}


function formatDateRange(start, end) {
    const formattedStart = formatMonthYear(start);
    const formattedEnd = formatMonthYear(end);

    if (!formattedStart) {
        return formattedEnd;
    }

    if (!formattedEnd) {
        return formattedStart;
    }

    return `${formattedStart} – ${formattedEnd}`;
}


/* --------------------------------
   Entry creation
-------------------------------- */

function createSocialEntry(item) {
    const link = document.createElement("a");

    link.className = "social-link";
    link.href = item.link;

    /*
        External links open in a new tab.
        mailto links simply open the user's
        configured email application.
    */
    if (!item.link.startsWith("mailto:")) {
        link.target = "_blank";
        link.rel = "noopener noreferrer";
    }

    const image = document.createElement("img");

    image.className = "social-link-icon";
    image.src = `images/${item.image}`;
    image.alt = "";

    /*
        Do not lazy-load these images.
        They are part of the initial page and
        the opening curtain waits for them.
    */

    const handle = document.createElement("span");

    handle.className = "social-link-handle";
    handle.textContent = item.handle;

    link.appendChild(image);
    link.appendChild(handle);

    return link;
}


function createImage(image) {
    const img = document.createElement("img");

    img.className = "entry-logo";
    img.src = `images/${image}`;
    img.alt = "";

    /*
        Do not lazy-load these images.
        They are part of the initial page and
        the opening curtain waits for them.
    */

    return img;
}


function createExperienceEntry(item) {
    const entry = document.createElement("article");
    entry.className = "entry";

    const logo = createImage(item.image);

    const content = document.createElement("div");
    content.className = "entry-content";

    const title = document.createElement("p");
    title.className = "entry-primary";
    title.textContent = item.title;

    const organization = document.createElement("p");
    organization.className = "entry-secondary";
    organization.textContent = item.organization;

    const date = document.createElement("p");
    date.className = "entry-date";
    date.textContent = formatDateRange(item.start, item.end);

    content.appendChild(title);
    content.appendChild(organization);
    content.appendChild(date);

    entry.appendChild(logo);
    entry.appendChild(content);

    return entry;
}


function createEducationEntry(item) {
    const entry = document.createElement("article");
    entry.className = "entry";

    const logo = createImage(item.image);

    const content = document.createElement("div");
    content.className = "entry-content";

    const degree = document.createElement("p");
    degree.className = "entry-primary";
    degree.textContent = item.degree;

    const school = document.createElement("p");
    school.className = "entry-secondary";
    school.textContent = item.school;

    const date = document.createElement("p");
    date.className = "entry-date";
    date.textContent = formatDateRange(item.start, item.end);

    content.appendChild(degree);
    content.appendChild(school);
    content.appendChild(date);

    entry.appendChild(logo);
    entry.appendChild(content);

    return entry;
}


function createAwardEntry(item) {
    const entry = document.createElement("article");
    entry.className = "entry";

    const logo = createImage(item.image);

    const content = document.createElement("div");
    content.className = "entry-content";

    const award = document.createElement("p");
    award.className = "entry-primary";
    award.textContent = item.award;

    const organization = document.createElement("p");
    organization.className = "entry-secondary";
    organization.textContent = item.organization;

    const date = document.createElement("p");
    date.className = "entry-date";
    date.textContent = formatMonthYear(item.date);

    content.appendChild(award);
    content.appendChild(organization);
    content.appendChild(date);

    entry.appendChild(logo);
    entry.appendChild(content);

    return entry;
}


/* --------------------------------
   Sorting
-------------------------------- */

function sortNewestFirst(items) {
    return [...items].sort((a, b) => {
        const dateA = a.start || a.date || "";
        const dateB = b.start || b.date || "";

        return dateB.localeCompare(dateA);
    });
}


/* --------------------------------
   Render sections
-------------------------------- */

async function renderSection(sectionName, config) {
    const container = document.querySelector(
        `[data-section="${sectionName}"]`
    );

    if (!container) {
        return;
    }

    try {
        const items = await loadCSV(config.file);

        if (config.type === "social") {
            items.forEach(item => {
                const entry = createSocialEntry(item);
                container.appendChild(entry);
            });

            return;
        }

        const sortedItems = sortNewestFirst(items);

        sortedItems.forEach(item => {
            let entry;

            if (config.type === "award") {
                entry = createAwardEntry(item);
            } else if (sectionName === "education") {
                entry = createEducationEntry(item);
            } else {
                entry = createExperienceEntry(item);
            }

            container.appendChild(entry);
        });
    } catch (error) {
        console.error(error);
    }
}


/* --------------------------------
   Wait for images
-------------------------------- */

async function waitForImages() {
    /*
        Wait for every <img> currently on the page.
        This includes the static images in index.html
        as well as the images generated from the CSV files.
    */
    const images = Array.from(document.images);

    const imagePromises = images.map(image => {
        if (image.complete) {
            if (typeof image.decode === "function") {
                return image.decode().catch(() => {});
            }

            return Promise.resolve();
        }

        return new Promise(resolve => {
            image.addEventListener("load", resolve, {
                once: true
            });

            image.addEventListener("error", resolve, {
                once: true
            });
        });
    });


    /*
        background.png is a CSS background rather than
        an <img>, so document.images does not include it.

        Explicitly load and decode it so the opening curtain
        does not disappear before the background is ready.
    */
    const backgroundImage = new Image();

    backgroundImage.src = "images/background.png";

    const backgroundPromise =
        typeof backgroundImage.decode === "function"
            ? backgroundImage.decode().catch(() => {})
            : new Promise(resolve => {
                backgroundImage.addEventListener("load", resolve, {
                    once: true
                });

                backgroundImage.addEventListener("error", resolve, {
                    once: true
                });
            });


    await Promise.all([
        ...imagePromises,
        backgroundPromise
    ]);
}


/* --------------------------------
   Scroll cue
-------------------------------- */

function initializeScrollCue() {
    const scrollCue = document.querySelector(".scroll-cue");

    if (!scrollCue) {
        return;
    }

    const updateScrollCue = () => {
        const shouldHide =
            window.scrollY > window.innerHeight * 0.12;

        scrollCue.classList.toggle(
            "is-hidden",
            shouldHide
        );
    };

    window.addEventListener("scroll", updateScrollCue, {
        passive: true
    });

    updateScrollCue();
}


/* --------------------------------
   Section fade animations
-------------------------------- */

function initializeSectionAnimations() {
    const sections = document.querySelectorAll(".resume-section");

    if (!("IntersectionObserver" in window)) {
        sections.forEach(section => {
            section.classList.add("is-visible");
        });

        return;
    }

    const observer = new IntersectionObserver(
        entries => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) {
                    return;
                }

                entry.target.classList.add("is-visible");

                observer.unobserve(entry.target);
            });
        },
        {
            threshold: 0.12,
            rootMargin: "0px 0px -8% 0px"
        }
    );

    sections.forEach(section => {
        observer.observe(section);
    });
}


/* --------------------------------
   Copyright year
-------------------------------- */

function initializeCopyrightYear() {
    const year = document.querySelector(".copyright-year");

    if (!year) {
        return;
    }

    year.textContent = new Date().getFullYear();
}


/* --------------------------------
   Initialize
-------------------------------- */

async function initialize() {
    history.scrollRestoration = "manual";
    window.scrollTo(0, 0);

    const pageLoader = document.querySelector(".page-loader");

    try {
        /*
            First load and render all CSV-driven content.
        */
        await Promise.all(
            Object.entries(sections).map(([name, config]) =>
                renderSection(name, config)
            )
        );

        /*
            Initialize everything that needs the rendered content.
        */
        initializeScrollCue();
        initializeSectionAnimations();
        initializeCopyrightYear();
        initializeBibleVerse();

        /*
            Now wait for all images, including the CSS background,
            to actually finish loading/decoding.
        */
        await waitForImages();

    } catch (error) {
        console.error(error);

    } finally {
        /*
            Give the browser two animation frames to paint the
            completed page before removing the opening curtain.
        */
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                if (pageLoader) {
                    pageLoader.classList.add("is-hidden");
                }
            });
        });
    }
}


initialize();
