"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Camera, UploadIcon, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { analyzeImage } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuth } from "@/components/auth-provider";
import { getScansUsedToday, incrementScanCount, hasReachedScanLimit } from "@/lib/scan-limit";
// Check if we're in a preview environment
const isPreview = typeof window !== "undefined" && window.location.hostname.includes("v0.dev");
// Maximum image size in bytes (4MB)
const MAX_IMAGE_SIZE = 4 * 1024 * 1024;
// Free scan limit per day
const FREE_SCAN_LIMIT = 3;
// Mock result for preview
const mockResult = {
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
export function Upload() {
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [mounted, setMounted] = useState(false);
    const [scansUsed, setScansUsed] = useState(0);
    const router = useRouter();
    const { toast } = useToast();
    const { user, userProfile } = useAuth();
    // Check if user has premium account
    const isPremium = userProfile?.account_type === "premium";
    // Only run on client side
    useEffect(() => {
        setMounted(true);
        if (typeof window !== "undefined") {
            setScansUsed(getScansUsedToday());
        }
    }, []);
    // Function to compress image using canvas
    const compressImage = async (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target?.result;
                img.onload = () => {
                    try {
                        // Calculate new dimensions while maintaining aspect ratio
                        let width = img.width;
                        let height = img.height;
                        const maxDimension = 1200;
                        if (width > height && width > maxDimension) {
                            height = (height * maxDimension) / width;
                            width = maxDimension;
                        }
                        else if (height > maxDimension) {
                            width = (width * maxDimension) / height;
                            height = maxDimension;
                        }
                        // Create canvas and draw image
                        const canvas = document.createElement("canvas");
                        canvas.width = width;
                        canvas.height = height;
                        const ctx = canvas.getContext("2d");
                        if (!ctx) {
                            throw new Error("Could not get canvas context");
                        }
                        ctx.drawImage(img, 0, 0, width, height);
                        // Convert to blob with reduced quality
                        canvas.toBlob((blob) => {
                            if (!blob) {
                                reject(new Error("Failed to compress image"));
                                return;
                            }
                            // Create new file from blob
                            const compressedFile = new File([blob], file.name, {
                                type: "image/jpeg",
                                lastModified: Date.now(),
                            });
                            resolve(compressedFile);
                        }, "image/jpeg", 0.8); // 80% quality
                    }
                    catch (err) {
                        console.error("Error in canvas operations:", err);
                        reject(err);
                    }
                };
                img.onerror = (err) => {
                    console.error("Error loading image:", err);
                    reject(new Error("Failed to load image"));
                };
            };
            reader.onerror = (err) => {
                console.error("Error reading file:", err);
                reject(new Error("Failed to read file"));
            };
        });
    };
    const processImage = async (file) => {
        try {
            // Check if user has reached daily scan limit
            if (!isPremium && hasReachedScanLimit(FREE_SCAN_LIMIT)) {
                router.push("/#pricing");
                return null;
            }
            // Validate file type
            if (!file.type.match(/image\/(jpeg|jpg|png)/i)) {
                setError("Please upload a JPEG or PNG image");
                return null;
            }
            // Check file size and compress if needed
            let processedFile = file;
            if (file.size > MAX_IMAGE_SIZE) {
                console.log(`Image too large (${file.size} bytes), compressing...`);
                try {
                    processedFile = await compressImage(file);
                    console.log(`Compressed image size: ${processedFile.size} bytes`);
                }
                catch (err) {
                    console.error("Error compressing image:", err);
                    // Continue with original file if compression fails
                    console.log("Using original file instead");
                }
            }
            setError(null);
            return processedFile;
        }
        catch (err) {
            console.error("Error processing image:", err);
            setError("Failed to process image. Please try another image.");
            return null;
        }
    };
    const handleImageChange = async (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const processedFile = await processImage(file);
            if (processedFile) {
                setImage(processedFile);
                const reader = new FileReader();
                reader.onload = (e) => {
                    setPreview(e.target?.result);
                };
                reader.readAsDataURL(processedFile);
            }
        }
    };
    const handleDrop = async (e) => {
        e.preventDefault();
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];
            const processedFile = await processImage(file);
            if (processedFile) {
                setImage(processedFile);
                const reader = new FileReader();
                reader.onload = (e) => {
                    setPreview(e.target?.result);
                };
                reader.readAsDataURL(processedFile);
            }
        }
    };
    const handleDragOver = (e) => {
        e.preventDefault();
    };
    const handleSubmit = async () => {
        if (!image || !mounted)
            return;
        try {
            setIsLoading(true);
            setError(null);
            // Check if user has reached daily scan limit
            if (!isPremium && hasReachedScanLimit(FREE_SCAN_LIMIT)) {
                router.push("/#pricing");
                return;
            }
            console.log("Submitting image for analysis:", image.name, "Size:", image.size, "Type:", image.type);
            // In preview mode, use mock result
            if (isPreview) {
                // Simulate API delay
                await new Promise((resolve) => setTimeout(resolve, 3000));
                // Store mock result in localStorage for the results page
                localStorage.setItem("analysisResult", JSON.stringify(mockResult));
                // Increment scan count for non-premium users
                if (!isPremium) {
                    const newCount = incrementScanCount();
                    setScansUsed(newCount);
                }
                // Navigate to results page
                console.log("Navigating to results page");
                router.push("/results");
                return;
            }
            // Create FormData and append the image
            const formData = new FormData();
            formData.append("image", image);
            // Call the server action to analyze the image with OpenAI
            console.log("Calling analyzeImage server action");
            const result = await analyzeImage(formData);
            console.log("Received result from server action");
            // Check if we got a valid result
            if (!result) {
                throw new Error("No result returned from image analysis");
            }
            console.log("Analysis result:", result.gluten_detected, "Extracted text length:", result.extracted_text?.length || 0);
            // If user is logged in, save the scan to the database
            if (user) {
                try {
                    // Dynamically import to prevent any SSR issues
                    const { getSupabaseBrowser } = await import("@/lib/supabase-browser");
                    const supabase = getSupabaseBrowser();
                    if (!supabase) {
                        console.error("Could not initialize Supabase client");
                        // Continue without saving to database
                    }
                    else {
                        // Upload the image to Supabase Storage
                        const imageFile = image;
                        const fileExt = imageFile.name.split(".").pop();
                        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
                        const { data: uploadData, error: uploadError } = await supabase.storage
                            .from("scan-images")
                            .upload(fileName, imageFile);
                        if (uploadError) {
                            console.error("Error uploading image:", uploadError);
                        }
                        else {
                            // Get the public URL for the uploaded image
                            const { data: { publicUrl }, } = supabase.storage.from("scan-images").getPublicUrl(fileName);
                            // Save the scan record to the database
                            const { error: insertError } = await supabase.from("scans").insert({
                                user_id: user.id,
                                image_url: publicUrl,
                                result: result,
                            });
                            if (insertError) {
                                console.error("Error saving scan to database:", insertError);
                            }
                        }
                    }
                }
                catch (dbError) {
                    console.error("Error saving scan to database:", dbError);
                    // Continue even if database save fails
                }
            }
            // Increment scan count for non-premium users
            if (!isPremium) {
                const newCount = incrementScanCount();
                setScansUsed(newCount);
            }
            // Store result in localStorage for the results page
            localStorage.setItem("analysisResult", JSON.stringify(result));
            // Navigate to results page
            console.log("Navigating to results page");
            router.push("/results");
        }
        catch (error) {
            console.error("Error during submission:", error);
            setError(error instanceof Error ? error.message : "Failed to analyze image. Please try again.");
            toast({
                title: "Error",
                description: "Failed to analyze image. Please try again with a clearer photo of the ingredients list.",
                variant: "destructive",
            });
        }
        finally {
            setIsLoading(false);
        }
    };
    const resetImage = () => {
        setImage(null);
        setPreview(null);
        setError(null);
    };
    if (!mounted) {
        return (<Card className="w-full max-w-md">
        <CardContent className="p-6">
          <div className="h-64 animate-pulse rounded-lg bg-slate-200"></div>
        </CardContent>
      </Card>);
    }
    // Show scan limit information for free users
    const renderScanLimitInfo = () => {
        if (isPremium)
            return null;
        return (<div className="mb-4 text-center text-sm">
        <p className="text-muted-foreground">
          {scansUsed} of {FREE_SCAN_LIMIT} free scans used today
        </p>
        <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
          <div className="h-full rounded-full bg-blue-600" style={{ width: `${(scansUsed / FREE_SCAN_LIMIT) * 100}%` }}></div>
        </div>
      </div>);
    };
    return (<Card className="w-full max-w-md">
      <CardContent className="p-6">
        {renderScanLimitInfo()}

        {error && (<Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4"/>
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>)}

        {!preview ? (<div className="flex h-64 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 p-6 transition-colors hover:border-blue-400 hover:bg-slate-100" onDrop={handleDrop} onDragOver={handleDragOver} onClick={() => document.getElementById("image-upload")?.click()}>
            <UploadIcon className="mb-4 h-10 w-10 text-slate-400"/>
            <p className="mb-2 text-center text-sm font-medium">Drop your food label photo here or click to upload</p>
            <p className="text-center text-xs text-muted-foreground">Supported formats: JPG, PNG (max 4MB)</p>
            <input id="image-upload" type="file" accept="image/jpeg, image/png" className="hidden" onChange={handleImageChange}/>
            <div className="mt-4 flex gap-2">
              <Button size="sm" variant="outline" className="mt-2" onClick={(e) => {
                e.stopPropagation();
                document.getElementById("image-upload")?.click();
            }}>
                <UploadIcon className="mr-2 h-4 w-4"/>
                Upload Image
              </Button>
              <Button size="sm" variant="outline" className="mt-2" onClick={(e) => {
                e.stopPropagation();
                // In a real app, this would open the camera
                document.getElementById("image-upload")?.click();
            }}>
                <Camera className="mr-2 h-4 w-4"/>
                Take Photo
              </Button>
            </div>
          </div>) : (<div className="flex flex-col items-center">
            <div className="relative mb-4 h-64 w-full overflow-hidden rounded-lg">
              <img src={preview || "/placeholder.svg"} alt="Food label preview" className="h-full w-full object-contain"/>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={resetImage}>
                Change Image
              </Button>
              <Button onClick={handleSubmit} disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
                {isLoading ? "Analyzing..." : "Confirm & Scan"}
              </Button>
            </div>
            {isLoading && (<div className="mt-4 text-center">
                <div className="mb-2 flex items-center justify-center">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
                  <span className="ml-2 text-sm">Analyzing ingredients...</span>
                </div>
                <p className="text-xs text-muted-foreground">This may take up to 15 seconds</p>
              </div>)}
          </div>)}
      </CardContent>
    </Card>);
}
