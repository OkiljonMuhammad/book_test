const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { fakerEN } = require('@faker-js/faker');
const { fakerDE } = require('@faker-js/faker');
const { fakerRU } = require('@faker-js/faker');

const app = express();
app.use(cors({
    origin: 'https://n-ap1c53oc9-okiljons-projects.vercel.app',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  }));
app.use(bodyParser.json());

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
        const title = fakerLocale.lorem.sentence();
        const authors = fakerLocale.person.fullName();
        const publisher = fakerLocale.company.name();
        const isbn = fakerLocale.commerce.isbn();
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

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));