"use client";
// Function to get the current date in YYYY-MM-DD format
const getCurrentDate = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
};
// Function to get the number of scans used today
export const getScansUsedToday = () => {
    if (typeof window === "undefined")
        return 0;
    try {
        const scanData = localStorage.getItem("mitch-scan-data");
        if (!scanData)
            return 0;
        const data = JSON.parse(scanData);
        const today = getCurrentDate();
        // If the stored date is not today, reset the counter
        if (data.date !== today) {
            localStorage.setItem("mitch-scan-data", JSON.stringify({ date: today, count: 0 }));
            return 0;
        }
        return data.count || 0;
    }
    catch (error) {
        console.error("Error getting scans used today:", error);
        return 0;
    }
};
// Function to increment the scan counter
export const incrementScanCount = () => {
    if (typeof window === "undefined")
        return 0;
    try {
        const today = getCurrentDate();
        const currentCount = getScansUsedToday();
        const newCount = currentCount + 1;
        localStorage.setItem("mitch-scan-data", JSON.stringify({ date: today, count: newCount }));
        return newCount;
    }
    catch (error) {
        console.error("Error incrementing scan count:", error);
        return 0;
    }
};
// Function to check if the user has reached the daily scan limit
export const hasReachedScanLimit = (limit = 3) => {
    return getScansUsedToday() >= limit;
};
// Function to reset the scan counter
export const resetScanCount = () => {
    if (typeof window === "undefined")
        return;
    try {
        const today = getCurrentDate();
        localStorage.setItem("mitch-scan-data", JSON.stringify({ date: today, count: 0 }));
    }
    catch (error) {
        console.error("Error resetting scan count:", error);
    }
};
