const fs = require('fs');
const path = require('path');

// Target directory: src/locales
const localesDir = path.join(__dirname, 'src', 'locales');
const enPath = path.join(localesDir, 'en.json');

// Ensure locales directory exists
if (!fs.existsSync(localesDir)) {
    console.error('Locales directory not found:', localesDir);
    process.exit(1);
}

// Read English source
const enContent = fs.readFileSync(enPath, 'utf8');

// List of supported languages (excluding 'en')
const languages = [
    'hi', 'bn', 'te', 'ta', 'mr', 'ur', 'bho', 'gu', 'kn', 'ml', 'or', 'pa', 'as', // Indian
    'ks', 'kok', 'sd', 'doi', 'mai', 'sat', 'ne', 'sa', 'mni', // New Indian
    'bhb', 'gon', 'kru', 'tcy', 'khn', // New additions
    'es', 'fr', 'de', 'it', 'pt', 'ru', 'zh', 'ja', 'ko', 'ar', 'tr', 'vi', 'th', // Global
    'nl', 'pl', 'sv', 'id', 'ms', 'fa', 'sw', 'uk', 'tl', 'he'
];

console.log(`Generating files for ${languages.length} languages...`);

languages.forEach(lang => {
    const filePath = path.join(localesDir, `${lang}.json`);
    // Write (or overwrite if user wants reset, but safer to only write if missing? 
    // User said "missing translation files", implies ones that don't exist.
    // I'll overwrite to ensure they are consistent placeholders if they are empty/broken.
    // Actually, I'll check existence to be safe, but for now assuming they are missing.
    try {
        if (!fs.existsSync(filePath)) {
            fs.writeFileSync(filePath, enContent);
            console.log(`✅ Created ${lang}.json`);
        } else {
            console.log(`⚠️ Skipped ${lang}.json (already exists)`);
        }
    } catch (err) {
        console.error(`❌ Failed to write ${lang}.json`, err);
    }
});

console.log('🎉 Locale generation complete.');
