"use server"

import sharp from 'sharp';
import crypto from 'crypto';

// TODO: Consider implementing a more sophisticated cache eviction strategy if memory usage becomes an issue (e.g., LRU cache).
const imageAnalysisCache = new Map();

// Flag to enable mock response for testing - set to false to use real API calls
const USE_MOCK_RESPONSE = false; 

// Mock response for testing (only used if USE_MOCK_RESPONSE is true)
const MOCK_RESPONSE = {
  extracted_text: "MOCK DATA",
  // ... other mock fields
};

export async function analyzeImage(formData: FormData) {
  try {
    console.log("Starting image analysis...");

    if (USE_MOCK_RESPONSE) {
      console.log("Using mock response for testing");
      return MOCK_RESPONSE;
    }

    const imageFile = formData.get("image") as File;

    if (!imageFile) {
      console.error("No image file provided");
      throw new Error("No image file provided");
    }

    console.log("Image file received:", imageFile.name, "Size:", imageFile.size, "Type:", imageFile.type);

    const arrayBuffer = await imageFile.arrayBuffer();
    const originalBuffer = Buffer.from(arrayBuffer);

    const hash = crypto.createHash('sha256').update(originalBuffer).digest('hex');

    if (imageAnalysisCache.has(hash)) {
      console.log(`Cache hit for image hash: ${hash}`);
      return imageAnalysisCache.get(hash);
    }
    console.log(`Cache miss for image hash: ${hash}`);

    console.log("Original image size:", originalBuffer.length);

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
        } else {
          newHeight = Math.min(metadata.height, targetDimension);
          newWidth = Math.round((metadata.width / metadata.height) * newHeight);
        }
      } else {
        newWidth = targetDimension;
        newHeight = targetDimension;
        console.warn("Image metadata not available, using default target dimensions for resizing.");
      }
      
      if (metadata.width && metadata.height && (newWidth > metadata.width || newHeight > metadata.height)) {
        newWidth = metadata.width;
        newHeight = metadata.height;
        console.log("Image is smaller than target, using original dimensions:", newWidth, "x", newHeight);
      }

      const resizedImageBuffer = await image
        .resize({
          width: newWidth,
          height: newHeight,
          fit: 'inside',
          withoutEnlargement: true
        })
        .jpeg({ quality: 80 }) // Convert to JPEG as per original logic
        .toBuffer();

      console.log("Resized image size:", resizedImageBuffer.length);
      console.log("Resized dimensions:", newWidth, "x", newHeight);

      const base64Image = resizedImageBuffer.toString('base64');
      dataURI = `data:image/jpeg;base64,${base64Image}`; // Explicitly use image/jpeg
    } catch (error) {
      console.error("Error processing image with sharp:", error);
      const base64Image = originalBuffer.toString("base64");
      const mimeType = imageFile.type || "image/jpeg"; // Fallback, but sharp aims for jpeg
      dataURI = `data:${mimeType};base64,${base64Image}`;
      console.warn("Falling back to original image due to processing error. URI length:", dataURI.length);
    }
    
    console.log("Final data URI length:", dataURI.length);

    const promptText = `You are an expert food safety assistant for people with celiac disease.

First, extract all visible text from this image, including ingredients lists, allergen notices, and labels like 'gluten-free' or 'may contain traces of wheat'. Return the extracted text as a string under a key called "extracted_text".

Then, based on the extracted text, analyze it for the following:
{
  "extracted_text": "extracted text here",
  "gluten_detected": "yes/no",
  "cross_contamination_risk": "low/medium/high",
  "additives_detected": ["additive1", "additive2"],
  "diet_compatibility": { "fodmap": "yes/no", "lactose_free": "yes/no", "keto": "yes/no" },
  "certification": "yes/no",
  "community_safe_rating": "simulated number from 80% to 100%",
  "ingredients_analysis": [ { "name": "ingredient name", "contains_gluten": "yes/no/maybe", "safety_level": "safe/caution/unsafe", "description": "brief description", "concerns": "specific health concerns or 'None'" } ]
}
If the text cannot be read, respond with:
{ "extracted_text": "", "gluten_detected": "unknown", "cross_contamination_risk": "high", "additives_detected": [], "diet_compatibility": { "fodmap": "unknown", "lactose_free": "unknown", "keto": "unknown" }, "certification": "no", "community_safe_rating": "85%", "ingredients_analysis": [] }`;

    console.log("Calling Grok API directly with fetch...");

    let attempts = 0;
    const maxAttempts = 3;
    let lastError = null;

    while (attempts < maxAttempts) {
      try {
        console.log(`API attempt ${attempts + 1} of ${maxAttempts}`);

        // IMPORTANT: When handling errors from the API call below,
        // be extremely careful not to log the raw error object or request details
        // if they might inadvertently include the 'Authorization' header,
        // as this could expose the XAI_API_KEY.
        // Log only specific, safe error messages or sanitized details.
        // The error handling in this try/catch block and the one wrapping the
        // whole function have been updated to reflect this.
        const response = await fetch("https://api.x.ai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.XAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: "grok-2-vision-1212", 
            messages: [
              {
                role: "user",
                content: [
                  { type: "text", text: promptText },
                  { type: "image_url", image_url: { url: dataURI } },
                ],
              },
            ],
            temperature: 0.2,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(`Grok API error: ${response.status} ${JSON.stringify(errorData)}`);
        }

        const responseData = await response.json();
        const text = responseData.choices[0]?.message?.content || "";
        console.log("Grok API call successful, response length:", text.length);

        try {
          let jsonStr = text;
          const jsonMatch = text.match(/\{[\s\S]*\}/m);
          if (jsonMatch) {
            jsonStr = jsonMatch[0];
            console.log("Extracted JSON object from response");
          }
          jsonStr = jsonStr.replace(/```json|```/g, "").trim();
          console.log("Cleaned JSON string length:", jsonStr.length);
          const result = JSON.parse(jsonStr);
          console.log("Successfully parsed JSON response");

          result.extracted_text = result.extracted_text || "";
          result.gluten_detected = result.gluten_detected || "unknown";
          // ... (add other validation/default setting for fields)
          
          console.log("Returning validated result");
          imageAnalysisCache.set(hash, result);
          console.log(`Stored result in cache for image hash: ${hash}`);
          return result;
        } catch (parseError) {
          console.error("Error parsing Grok response:", parseError);
          console.error("Error parsing Grok response. Response snippet (first 100 chars):", text.substring(0, 100));
          throw parseError;
        }
      } catch (error) {
        if (error instanceof Error && error.message.startsWith("Grok API error")) {
          console.error(`API attempt ${attempts + 1} failed: ${error.message}`);
        } else if (error instanceof Error) {
          // Potentially a network error or other fetch-related error
          // Accessing error.response might not be safe if 'error' is not an HTTP error object.
          // Let's be cautious and primarily log the message.
          let errorMessage = `API attempt ${attempts + 1} failed with network or fetch error: ${error.message}.`;
          // @ts-ignore
          if (error.response && error.response.status) {
            // @ts-ignore
            errorMessage += ` Status: ${error.response.status}`;
          }
          console.error(errorMessage);
        } else {
          console.error(`API attempt ${attempts + 1} failed with an unknown error.`);
        }
        lastError = error;
        attempts++;
        if (attempts < maxAttempts) {
          const delay = Math.pow(2, attempts) * 1000;
          console.log(`Retrying in ${delay}ms...`);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    if (lastError) { // Ensure lastError is not null before logging
      if (lastError instanceof Error && lastError.message.startsWith("Grok API error")) {
        console.error(`All API attempts failed. Last error: ${lastError.message}`);
      } else if (lastError instanceof Error) {
        let errorMsg = `All API attempts failed. Last network or fetch error: ${lastError.message}.`;
        // @ts-ignore
        if (lastError.response && lastError.response.status) {
          // @ts-ignore
          errorMsg += ` Status: ${lastError.response.status}`;
        }
        console.error(errorMsg);
      } else {
        console.error("All API attempts failed with an unknown error type.");
      }
    } else {
      console.error("All API attempts failed, but lastError was null. This should not happen."); // Should ideally not occur
    }

    let finalErrorMessage = `Failed after ${maxAttempts} attempts. An unexpected error occurred.`;
    if (lastError instanceof Error) {
        if (lastError.message.startsWith("Grok API error")) {
            // This message is from our controlled error construction, should be safe
            finalErrorMessage = `Failed after ${maxAttempts} attempts: ${lastError.message}`;
        } else {
            // Potentially a network error or other fetch-related error.
            // Avoid including the full lastError.message if it's not controlled.
            // Server-side logs (handled by previous console.error sanitization) have more details.
            finalErrorMessage = `Failed after ${maxAttempts} attempts. A server-side issue occurred (e.g. network, API availability). Error type: ${lastError.name || 'UnknownError'}. Check server logs for details.`;
        }
    } else if (lastError) {
        finalErrorMessage = `Failed after ${maxAttempts} attempts due to an unknown issue. Check server logs for details.`;
    }
    // Note: The 'lastError' object itself is not included in the thrown error message to the client here,
    // only specific parts of its message if it's a "Grok API error", or a generic message otherwise.
    throw new Error(finalErrorMessage);
  } catch (error) {
    // General error handler for the entire analyzeImage function
    if (error instanceof Error && error.message.startsWith("Grok API error")) {
      // This case might occur if the error propagates here, though less likely with the current structure
      console.error(`Error analyzing image: ${error.message}`);
    } else if (error instanceof Error && (error.message.includes("network") || error.message.includes("fetch") || (error.cause && typeof error.cause === 'object' && 'message' in error.cause && String(error.cause.message).includes("ECONNREFUSED")) )) {
      // Check for common fetch/network related keywords or if error.cause indicates a network issue
      let errorMessage = `Error analyzing image (network/fetch related): ${error.message}.`;
      // @ts-ignore
      if (error.response && error.response.status) {
        // @ts-ignore
        errorMessage += ` Status: ${error.response.status}`;
      }
      console.error(errorMessage);
    } else if (error instanceof Error) {
      // For other errors (e.g., sharp processing, file errors), logging the message is generally safe.
      // Avoid logging the full 'error' object to be safe, stick to 'error.message'.
      console.error(`Error analyzing image: ${error.message}`);
    } else {
      console.error("Error analyzing image: An unknown error occurred.");
    }
    return {
      extracted_text: "", gluten_detected: "unknown", cross_contamination_risk: "high",
      additives_detected: [], diet_compatibility: { fodmap: "unknown", lactose_free: "unknown", keto: "unknown" },
      certification: "no", community_safe_rating: "85%", ingredients_analysis: [],
    };
  }
}
