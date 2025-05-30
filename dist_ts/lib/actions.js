"use server";
import sharp from 'sharp';
import crypto from 'crypto';
// TODO: Consider implementing a more sophisticated cache eviction strategy if memory usage becomes an issue (e.g., LRU cache).
const imageAnalysisCache = new Map();
// Flag to enable mock response for testing - set to false to use real API calls
const USE_MOCK_RESPONSE = false;
// Mock response for testing (only used if USE_MOCK_RESPONSE is true)
const MOCK_RESPONSE = {
    extracted_text: "INGREDIENTS: Water, Rice Flour, Tapioca Starch, Potato Starch, Vegetable Oil (Canola and/or Sunflower Oil), Cane Sugar, Tapioca Syrup, Pea Protein, Salt, Yeast, Psyllium Husk, Cellulose, Xanthan Gum, Vitamin E (Mixed Tocopherols to Maintain Freshness).\nCONTAINS: DOES NOT CONTAIN WHEAT, DAIRY, EGGS, NUTS, OR SOY.\nCERTIFIED GLUTEN-FREE",
    gluten_detected: "no",
    cross_contamination_risk: "low",
    additives_detected: ["Xanthan Gum", "Mixed Tocopherols"],
    diet_compatibility: {
        fodmap: "yes",
        lactose_free: "yes",
        keto: "no",
    },
    certification: "yes",
    community_safe_rating: "95%",
    ingredients_analysis: [
        {
            name: "Rice Flour",
            contains_gluten: "no",
            safety_level: "safe",
            description: "Flour made from ground rice grains",
            concerns: "None",
        },
        {
            name: "Tapioca Starch",
            contains_gluten: "no",
            safety_level: "safe",
            description: "Starch extracted from cassava root",
            concerns: "None",
        },
        {
            name: "Potato Starch",
            contains_gluten: "no",
            safety_level: "safe",
            description: "Starch extracted from potatoes",
            concerns: "None",
        },
        {
            name: "Vegetable Oil",
            contains_gluten: "no",
            safety_level: "safe",
            description: "Oil derived from canola or sunflower seeds",
            concerns: "None",
        },
        {
            name: "Xanthan Gum",
            contains_gluten: "no",
            safety_level: "caution",
            description: "A food additive used as a thickener and stabilizer",
            concerns: "Some people with severe gluten sensitivity may react to xanthan gum, though it is generally considered safe for celiac disease",
        },
        {
            name: "Psyllium Husk",
            contains_gluten: "no",
            safety_level: "safe",
            description: "Fiber from the seeds of the Plantago plant",
            concerns: "None",
        },
    ],
};
export async function analyzeImage(formData) {
    try {
        console.log("Starting image analysis...");
        // If using mock response for testing, return it immediately
        if (USE_MOCK_RESPONSE) {
            console.log("Using mock response for testing");
            return MOCK_RESPONSE;
        }
        // Get the image file from the form data
        const imageFile = formData.get("image");
        if (!imageFile) {
            console.error("No image file provided");
            throw new Error("No image file provided");
        }
        console.log("Image file received:", imageFile.name, "Size:", imageFile.size, "Type:", imageFile.type);
        // Get the image data
        const arrayBuffer = await imageFile.arrayBuffer();
        const originalBuffer = Buffer.from(arrayBuffer);
        // Generate hash from original image buffer for cache key
        const hash = crypto.createHash('sha256').update(originalBuffer).digest('hex');
        // Check cache
        if (imageAnalysisCache.has(hash)) {
            console.log(`Cache hit for image hash: ${hash}`);
            return imageAnalysisCache.get(hash);
        }
        console.log(`Cache miss for image hash: ${hash}`);
        console.log("Original image size:", originalBuffer.length);
        // Process image with sharp
        let dataURI;
        try {
            const image = sharp(originalBuffer);
            const metadata = await image.metadata();
            console.log("Original dimensions:", metadata.width, "x", metadata.height);
            const targetDimension = 1024;
            let newWidth, newHeight;
            if (metadata.width && metadata.height) {
                if (metadata.width > metadata.height) {
                    newWidth = Math.min(metadata.width, targetDimension);
                    newHeight = Math.round((metadata.height / metadata.width) * newWidth);
                }
                else {
                    newHeight = Math.min(metadata.height, targetDimension);
                    newWidth = Math.round((metadata.width / metadata.height) * newHeight);
                }
            }
            else {
                // Fallback if metadata is not available (should not happen with sharp)
                newWidth = targetDimension;
                newHeight = targetDimension;
                console.warn("Image metadata not available, using default target dimensions for resizing.");
            }
            // Ensure not to upscale if the image is smaller than targetDimension
            if (metadata.width && metadata.height && (newWidth > metadata.width || newHeight > metadata.height)) {
                newWidth = metadata.width;
                newHeight = metadata.height;
                console.log("Image is smaller than target, using original dimensions:", newWidth, "x", newHeight);
            }
            const resizedImageBuffer = await image
                .resize({
                width: newWidth,
                height: newHeight,
                fit: 'inside', // Preserves aspect ratio
                withoutEnlargement: true // Prevents upscaling
            })
                .jpeg({ quality: 80 })
                .toBuffer();
            console.log("Resized image size:", resizedImageBuffer.length);
            console.log("Resized dimensions:", newWidth, "x", newHeight);
            const base64Image = resizedImageBuffer.toString('base64');
            const mimeType = 'image/jpeg'; // Since we converted to JPEG
            dataURI = `data:${mimeType};base64,${base64Image}`;
        }
        catch (error) {
            console.error("Error processing image with sharp:", error);
            // Fallback to original image if sharp processing fails
            const base64Image = originalBuffer.toString("base64");
            const mimeType = imageFile.type || "image/jpeg";
            dataURI = `data:${mimeType};base64,${base64Image}`;
            console.warn("Falling back to original image due to processing error. URI length:", dataURI.length);
        }
        console.log("Final data URI length:", dataURI.length);
        // Prepare the improved prompt for OpenAI
        const promptText = `You are an expert food safety assistant for people with celiac disease.

First, extract all visible text from this image, including ingredients lists, allergen notices, and labels like 'gluten-free' or 'may contain traces of wheat'. Return the extracted text as a string under a key called "extracted_text".

Then, based on the extracted text, analyze it for the following:

- Detect any ingredients related to gluten, including wheat, barley, rye, malt, oats (unless certified gluten-free), and hidden sources like modified food starch.
- Detect additives such as carrageenan, xanthan gum, artificial sweeteners (aspartame, sucralose, saccharin), artificial colors, or preservatives.
- Identify cross-contamination risks like 'may contain traces of wheat'.
- Check for labels like 'gluten-free certified'.

For each ingredient, provide:
- Whether it contains gluten (yes/no/maybe)
- Health safety level for celiac patients (safe/caution/unsafe)
- Brief description of the ingredient
- Concise concerns for celiac patients, or 'None' if safe.

IMPORTANT: Return ONLY a valid JSON object in exactly this format without any extra text or markdown:

{
  "extracted_text": "extracted text here",
  "gluten_detected": "yes/no",
  "cross_contamination_risk": "low/medium/high",
  "additives_detected": ["additive1", "additive2"],
  "diet_compatibility": {
    "fodmap": "yes/no",
    "lactose_free": "yes/no",
    "keto": "yes/no"
  },
  "certification": "yes/no",
  "community_safe_rating": "simulated number from 80% to 100%",
  "ingredients_analysis": [
    {
      "name": "ingredient name",
      "contains_gluten": "yes/no/maybe",
      "safety_level": "safe/caution/unsafe",
      "description": "brief description",
      "concerns": "specific health concerns or 'None'"
    }
  ]
}

If the text cannot be read, respond with:

{
  "extracted_text": "",
  "gluten_detected": "unknown",
  "cross_contamination_risk": "high",
  "additives_detected": [],
  "diet_compatibility": {
    "fodmap": "unknown",
    "lactose_free": "unknown",
    "keto": "unknown"
  },
  "certification": "no",
  "community_safe_rating": "85%",
  "ingredients_analysis": []
}`;
        console.log("Calling OpenAI API directly with fetch...");
        // Call OpenAI API with retry logic
        let attempts = 0;
        const maxAttempts = 3;
        let lastError = null;
        while (attempts < maxAttempts) {
            try {
                console.log(`API attempt ${attempts + 1} of ${maxAttempts}`);
                // Call OpenAI API directly using fetch
                const response = await fetch("https://api.openai.com/v1/chat/completions", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
                    },
                    body: JSON.stringify({
                        // TODO: Investigate using "gpt-4-turbo" as a potentially more cost-effective model.
                        // It also supports vision and might offer a good balance between performance and cost
                        // for this image analysis task. Thorough testing would be needed to ensure quality
                        // is maintained.
                        model: "gpt-4o",
                        messages: [
                            {
                                role: "user",
                                content: [
                                    { type: "text", text: promptText },
                                    // Fix: image_url should be an object with a url property
                                    { type: "image_url", image_url: { url: dataURI } },
                                ],
                            },
                        ],
                        temperature: 0.2, // Lower temperature for more consistent results
                    }),
                });
                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(`OpenAI API error: ${response.status} ${JSON.stringify(errorData)}`);
                }
                const responseData = await response.json();
                // Extract the text from the response
                const text = responseData.choices[0]?.message?.content || "";
                console.log("OpenAI API call successful, response length:", text.length);
                // Parse the JSON response with improved error handling
                try {
                    // Extract JSON from the response
                    let jsonStr = text;
                    // Try to find JSON object in the response if it's not already valid JSON
                    const jsonMatch = text.match(/\{[\s\S]*\}/m);
                    if (jsonMatch) {
                        jsonStr = jsonMatch[0];
                        console.log("Extracted JSON object from response");
                    }
                    // Clean the response to ensure it's valid JSON
                    jsonStr = jsonStr
                        .replace(/```json|```/g, "") // Remove markdown code blocks
                        .trim();
                    console.log("Cleaned JSON string length:", jsonStr.length);
                    // Try to parse the JSON
                    const result = JSON.parse(jsonStr);
                    console.log("Successfully parsed JSON response");
                    // Validate the result has the expected structure
                    if (!result.extracted_text) {
                        console.log("No extracted_text in response, setting to empty string");
                        result.extracted_text = "";
                    }
                    if (!result.gluten_detected) {
                        console.log("No gluten_detected in response, setting to unknown");
                        result.gluten_detected = "unknown";
                    }
                    if (!result.cross_contamination_risk) {
                        console.log("No cross_contamination_risk in response, setting to high");
                        result.cross_contamination_risk = "high";
                    }
                    if (!result.additives_detected || !Array.isArray(result.additives_detected)) {
                        console.log("No valid additives_detected in response, setting to empty array");
                        result.additives_detected = [];
                    }
                    if (!result.diet_compatibility || typeof result.diet_compatibility !== "object") {
                        console.log("No valid diet_compatibility in response, setting defaults");
                        result.diet_compatibility = {
                            fodmap: "unknown",
                            lactose_free: "unknown",
                            keto: "unknown",
                        };
                    }
                    if (!result.certification) {
                        console.log("No certification in response, setting to no");
                        result.certification = "no";
                    }
                    if (!result.community_safe_rating) {
                        console.log("No community_safe_rating in response, setting to 85%");
                        result.community_safe_rating = "85%";
                    }
                    if (!result.ingredients_analysis || !Array.isArray(result.ingredients_analysis)) {
                        console.log("No valid ingredients_analysis in response, setting to empty array");
                        result.ingredients_analysis = [];
                    }
                    console.log("Returning validated result");
                    // Store successful result in cache
                    imageAnalysisCache.set(hash, result);
                    console.log(`Stored result in cache for image hash: ${hash}`);
                    return result;
                }
                catch (parseError) {
                    console.error("Error parsing OpenAI response:", parseError);
                    console.error("Response text:", text);
                    throw parseError;
                }
            }
            catch (error) {
                console.error(`API attempt ${attempts + 1} failed:`, error);
                lastError = error;
                attempts++;
                // Wait before retrying (exponential backoff)
                if (attempts < maxAttempts) {
                    const delay = Math.pow(2, attempts) * 1000;
                    console.log(`Retrying in ${delay}ms...`);
                    await new Promise((resolve) => setTimeout(resolve, delay));
                }
            }
        }
        console.error("All API attempts failed:", lastError);
        throw new Error(`Failed after ${maxAttempts} attempts: ${lastError?.message || "Unknown error"}`);
    }
    catch (error) {
        console.error("Error analyzing image:", error);
        // Return a fallback result for any error
        return {
            extracted_text: "",
            gluten_detected: "unknown",
            cross_contamination_risk: "high",
            additives_detected: [],
            diet_compatibility: {
                fodmap: "unknown",
                lactose_free: "unknown",
                keto: "unknown",
            },
            certification: "no",
            community_safe_rating: "85%",
            ingredients_analysis: [],
        };
    }
}
