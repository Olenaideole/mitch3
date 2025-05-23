"use server"

const USE_MOCK_RESPONSE = false

const MOCK_RESPONSE = {
  extracted_text: "INGREDIENTS: Water, Rice Flour...",
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
  ingredients_analysis: [],
}

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions"
const MODEL = "gpt-4o"
const TEMPERATURE = 0.2

const DEFAULT_RESPONSE = {
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
}

const PROMPT_TEMPLATE = `You are an expert food safety assistant for people with celiac disease.

Extract all visible text from this image, including ingredients lists, allergen notices, and labels like 'gluten-free' or 'may contain traces of wheat'. Return the extracted text as a string under "extracted_text".

Then, based on this text, analyze for:
- Gluten-containing ingredients (wheat, barley, rye, malt, oats unless certified)
- Additives (carrageenan, xanthan gum, sweeteners, colors, preservatives)
- Cross-contamination risks like 'may contain traces of wheat'
- Gluten-free certification labels

For each ingredient:
- contains_gluten: yes/no/maybe
- safety_level: safe/caution/unsafe
- description
- concerns: specific notes or 'None'

Respond ONLY with this exact JSON format and nothing else:

{
  "extracted_text": "text",
  "gluten_detected": "yes/no",
  "cross_contamination_risk": "low/medium/high",
  "additives_detected": [],
  "diet_compatibility": {
    "fodmap": "yes/no",
    "lactose_free": "yes/no",
    "keto": "yes/no"
  },
  "certification": "yes/no",
  "community_safe_rating": "80%-100%",
  "ingredients_analysis": []
}

If unreadable, respond with:

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
}`

export async function analyzeImage(formData: FormData) {
  console.log("Starting image analysis...")

  if (USE_MOCK_RESPONSE) {
    console.log("Using mock response")
    return MOCK_RESPONSE
  }

  const imageFile = formData.get("image") as File
  if (!imageFile) throw new Error("No image file provided")

  console.log(`Received file: ${imageFile.name}, Size: ${imageFile.size}, Type: ${imageFile.type}`)

  const arrayBuffer = await imageFile.arrayBuffer()
  const dataURI = `data:${imageFile.type};base64,${Buffer.from(arrayBuffer).toString("base64")}`

  const payload = {
    model: MODEL,
    temperature: TEMPERATURE,
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: PROMPT_TEMPLATE },
          { type: "image_url", image_url: { url: dataURI } },
        ],
      },
    ],
  }

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
  }

  let attempts = 0
  const maxAttempts = 3
  let lastError: unknown

  while (attempts < maxAttempts) {
    try {
      console.log(`API attempt ${attempts + 1}`)

      const res = await fetch(OPENAI_API_URL, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(`OpenAI API error: ${res.status} ${JSON.stringify(errorData)}`)
      }

      const data = await res.json()
      const rawText = data.choices[0]?.message?.content || ""

      const jsonMatch = rawText.match(/\{[\s\S]*\}/m)
      const jsonString = jsonMatch ? jsonMatch[0].replace(/```json|```/g, "").trim() : ""

      if (!jsonString) throw new Error("No JSON found in response")

      const result = JSON.parse(jsonString)

      // Fill in any missing fields with defaults
      const finalResult = {
        ...DEFAULT_RESPONSE,
        ...result,
        diet_compatibility: { ...DEFAULT_RESPONSE.diet_compatibility, ...(result.diet_compatibility || {}) },
        ingredients_analysis: Array.isArray(result.ingredients_analysis)
          ? result.ingredients_analysis
          : [],
      }

      console.log("Successful result:", finalResult)
      return finalResult
    } catch (err) {
      console.error(`Attempt ${attempts + 1} failed:`, err)
      lastError = err
      attempts++
    }
  }

  console.error("All attempts failed")
  throw lastError
}
