const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { fakerEN } = require('@faker-js/faker');
const { fakerDE } = require('@faker-js/faker');
const { fakerRU } = require('@faker-js/faker');
const generateBookCover = require("./generateCover");

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'build')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

const ITEMS_PER_PAGE = 20;

const LOCALE_MAP = {
    en: fakerEN,
    de: fakerDE,
    ru: fakerRU,
};

const generateBooks = (seed, page, region, likes, reviews) => {
    const fakerLocale = LOCALE_MAP[region] || fakerEN;
    if (!fakerLocale) {
        console.error(`Invalid region: ${region}. Falling back to 'en'.`);
    }
    const regionSeed = Array.from(region).reduce((acc, char) => acc + char.charCodeAt(0), 0);
    fakerLocale.seed(seed + page + regionSeed + Math.round(likes * 100) + Math.round(reviews * 100));

    return Array.from({ length: ITEMS_PER_PAGE }, (_, index) => {
        const isEnglish = fakerLocale === fakerEN;

        const title = isEnglish ? fakerLocale.book.title() : fakerLocale.lorem.sentence();
        const authors = isEnglish ? fakerLocale.book.author() : fakerLocale.person.fullName();
        const publisher = isEnglish ? fakerLocale.book.publisher() : fakerLocale.company.name();
        const isbn = fakerLocale.string.numeric(13);
        const totalReviews = Math.floor(reviews) + (Math.random() < (reviews % 1) ? 1 : 0);
        const reviewsList = Array.from({ length: totalReviews }, () => ({
            author: fakerLocale.person.fullName(),
            text: fakerLocale.lorem.sentence(),
        }));

        const randomLikes = Math.random() * likes;
        const likesPerBook = Math.round(randomLikes * 10) / 10;

        return {
            index: index + 1 + page * ITEMS_PER_PAGE,
            isbn,
            title,
            authors,
            publisher,
            likes: likesPerBook,
            reviews: reviewsList,
        };
    });
};

app.get("/books", (req, res) => {
    const { seed, page, region, likes, reviews } = req.query;
    const validRegion = LOCALE_MAP[region] ? region : "en";
    const books = generateBooks(
        Number(seed) || 0,
        Number(page) || 0,
        validRegion,
        parseFloat(likes) || 0, 
        parseFloat(reviews) || 0
    );

    res.json({ books });
});

app.get("/book-cover", async (req, res) => {
    const { title, author } = req.query;

    if (!title || !author) {
        return res.status(400).json({ error: "Title and author are required" });
    }

    try {
        const imageBuffer = await generateBookCover(title, author);

        res.set("Content-Type", "image/png");

        res.send(imageBuffer);
    } catch (error) {
        console.error("Error generating book cover:", error);
        res.status(500).json({ error: "Failed to generate book cover" });
    }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));







