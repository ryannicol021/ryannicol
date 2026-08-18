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
    image.loading = "lazy";

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
    img.loading = "lazy";

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
   Initialize
-------------------------------- */

async function initialize() {
    const pageLoader = document.querySelector(".page-loader");

    try {
        await Promise.all(
            Object.entries(sections).map(([name, config]) =>
                renderSection(name, config)
            )
        );

        initializeScrollCue();
        initializeSectionAnimations();
        initializeCopyrightYear();
    } finally {
        /*
            Give the browser a moment to paint the
            fully populated page before removing the
            opening curtain.
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

function initializeCopyrightYear() {
    const year = document.querySelector(".copyright-year");

    if (!year) {
        return;
    }

    year.textContent = new Date().getFullYear();
}
