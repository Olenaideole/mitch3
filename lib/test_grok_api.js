// test_grok_api.js
// This script directly tests the Grok API call using plain JavaScript (CommonJS)

const fetch = require('node-fetch'); // For making HTTP requests in Node.js
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env file in the project root
const envPath = path.resolve(__dirname, '../.env');
const dotenvResult = dotenv.config({ path: envPath });

if (dotenvResult.error) {
  console.error("Error loading .env file:", dotenvResult.error);
  process.exit(1);
}

console.log("GROK_API_KEY loaded:", process.env.GROK_API_KEY ? `Yes - First 5: ${process.env.GROK_API_KEY.substring(0,5)}` : "No / Not Loaded");

// Simplified prompt (exact prompt text is not the primary focus here)
const promptText = "Extract all visible text from this image.";

// Hardcoded base64 dataURI for a 32x32 pixel black JPEG (meets >512 pixels requirement)
const dataURI = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/4QAiRXhpZgAASUkqAAgAAAABABIBAwABAAAAAQAAABoBBQABAAAAVgAAABsBBQABAAAAXgAAACgBAwABAAAAAgAAADEBAgANAAAAZgAAADIBAgAUAAAAdAAAAGmHBAABAAAAiAAAAJoAAACgAAAAAQAAAGAAAAABAAAAQVNDSUkAAABTY3JlZW5zaG90/9sAQwADAgIDAgIDAwMDBAMDBAUIBQUEBAUKBwcGCAwKDAwLCgsLDQ4SEA0OEQ4LCxAWEBETFBUVFQwPFxgWFBgSFBUU/9sAQwEDBAQFBAUJBQUJFA0LDRQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQU/8AAEQgAIAAgAwEiAAIRAQMRAf/EAB8AAAEFAQEBAQEBAAAAAAAAAAABAgMEBQYHCAkKC//EALUQAAIBAwMCBAMFBQQEAAABfQECAwAEEQUSITFBBhNRYQcicRQygZGhCCNCscEVUtHwJDNicoIJChYXGBkaJSYnKCkqNDU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6g4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09TV1tfY2drh4uPk5ebn6Onq8fLz9PX29/j5+v/EAB8BAAMBAQEBAQEBAQEAAAAAAAABAgMEBQYHCAkKC//EALURAAIBAgQEAwQHBQQEAAECdwABAgMRBAUhMQYSQVEHYXETIjKBCBRCkaGxwQkjM1LwFWJy0QoWJDThJfEXGBkaJicoKSo1Njc4OTpDREVGR0hJSlNUVVZXWFlaY2RlZmdoaWpzdHV2d3h5eoKDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6epr8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD+/iiiigAoqKe4itYJJ55FihhQu7ucKqgZJJ7ACuS8N/FzwH4y1ebR/DnjXw/ruq26l5bLTtUt7mZFHUsisWA+ooA7Ciuf1bxj4a0DUrPTdW8QaVpmo6g/l2lpeXkUM1w3HyxqxBc8jjGeRXQUAFFFFABRRRQAUUUUAFFFFAH//2Q==";

// Construct the messages array for the API request
const messages = [
  {
    role: "user",
    content: [
      { type: "text", text: promptText },
      { type: "image_url", image_url: { url: dataURI } },
    ],
  },
];

// API request parameters
const apiUrl = "https://api.x.ai/v1/chat/completions";
const apiKey = process.env.GROK_API_KEY;
const requestBody = {
  model: "grok-2-vision-1212",
  messages: messages,
  temperature: 0.2,
};

async function testGrokApi() {
  if (!apiKey) {
    console.error("GROK_API_KEY is not set. Please check your .env file.");
    return;
  }

  console.log("Attempting to call Grok API...");
  console.log("API URL:", apiUrl);
  console.log("Request Body (model):", requestBody.model);

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    console.log("\n--- API Response ---");
    console.log("Status:", response.status, response.statusText);
    
    // Log relevant headers
    console.log("Headers:");
    console.log("  Content-Type:", response.headers.get('content-type'));
    console.log("  Date:", response.headers.get('date'));
    console.log("  X-Request-ID:", response.headers.get('x-request-id')); // Example header, might vary

    const responseBody = await response.json();
    console.log("\nResponse Body (JSON):");
    console.log(JSON.stringify(responseBody, null, 2));

    // Check for compatibility with lib/actions.ts parsing logic
    if (responseBody.choices && responseBody.choices[0] && responseBody.choices[0].message && responseBody.choices[0].message.content) {
      console.log("\nResponse structure IS LIKELY COMPATIBLE with lib/actions.ts (has choices[0].message.content).");
    } else {
      console.log("\nResponse structure IS LIKELY NOT COMPATIBLE with lib/actions.ts (missing choices[0].message.content).");
    }

  } catch (error) {
    console.error("\n--- Error during API call ---");
    console.error("Error type:", error.name);
    console.error("Error message:", error.message);
    if (error.response) { // If node-fetch wraps the response in the error
      console.error("Error response status:", error.response.status);
      const errorBody = await error.response.text();
      console.error("Error response body:", errorBody);
    }
  }
}

testGrokApi();
