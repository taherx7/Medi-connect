const Tesseract = require('tesseract.js');

/**
 * Scans an image for a specific word.
 * @param {string} imageUrl - The URL or path of the image to scan.
 * @param {string} targetWord - The word to search for.
 * @param {string} language - The language code (default: 'ara').
 * @returns {Promise<boolean>} - True if the word is found, false otherwise.
 */
async function scanImageForWord(imageUrl, targetWord, language = 'ara') {
    try {
        const { data: { text } } = await Tesseract.recognize(
            imageUrl,
            language,
            {
                // logger: m => console.log(m) // Log progress
            }
        );

        const found = text.includes(targetWord);
        return found;
    } catch (error) {
        console.error('Error scanning image:', error);
        return false;
    }
}

/**
 * Simplified scan function that searches for "طبيب" in Arabic.
 * @param {string} url - The image URL.
 * @returns {Promise<boolean>}
 */
async function scan(url) {
    return await scanImageForWord(url, 'طبيب', 'ara');
}

module.exports = { scan };
