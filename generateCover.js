const { createCanvas, loadImage } = require("canvas");
const fs = require("fs");

const generateBookCover = async (title, author) => {
    const canvas = createCanvas(200, 300);
    const ctx = canvas.getContext("2d");

    const backgroundImages = ["img1.jpg", "img2.jpg", "img3.jpg","img4.jpg", "img5.jpg", "img6.jpg","img7.jpg", "img8.jpg", "img9.jpg", "img10.jpg"];
    const randomBackground = backgroundImages[Math.floor(Math.random() * backgroundImages.length)];

    const background = await loadImage(`./images/${randomBackground}`);
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "black";
    ctx.textAlign = "center";

    const wrapText = (text, maxWidth) => {
        const words = text.split(" ");
        const lines = [];
        let currentLine = words[0];

        for (let i = 1; i < words.length; i++) {
            const word = words[i];
            const width = ctx.measureText(currentLine + " " + word).width;
            if (width < maxWidth) {
                currentLine += " " + word;
            } else {
                lines.push(currentLine);
                currentLine = word;
            }
        }
        lines.push(currentLine);
        return lines;
    };

    ctx.font = "20px Arial";

    const maxTitleWidth = canvas.width - 20; 
    const titleLines = wrapText(title, maxTitleWidth);

    const titleY = canvas.height / 4; 
    const lineHeight = 25; 
    titleLines.forEach((line, index) => {
        ctx.fillText(line, canvas.width / 2, titleY + index * lineHeight);
    });

    const authorY = titleY + titleLines.length * lineHeight + 20; 
    ctx.font = "16px Arial";
    ctx.fillText(`by ${author}`, canvas.width / 2, authorY);

    return canvas.toBuffer("image/png");
};

module.exports = generateBookCover;