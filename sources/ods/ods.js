// sources/ods/ods.js

// IMPORTANT: Ensure NO backticks (`) or ${...} syntax are used ANYWHERE below.
// Use comma-separation for all console.log/console.error
// Use string concatenation (' + variable) for error messages

console.log('[ods] Script starting execution.');

// Define the async function that fetches and returns the data array
const fetchData = async () => {
    let url = 'https://opendata.westofengland-ca.gov.uk/api/explore/v2.1/catalog/datasets/lep-epc-domestic-point/exports/json?limit=200&timezone=UTC&use_labels=false';
    console.log('[ods] fetchData: Starting fetch from URL:', url);

    try {
        const response = await fetch(url);
        // Store status in a variable first to avoid potential issues accessing it multiple times
        const status = response.status;
        console.log('[ods] fetchData: Response status:', status);

        if (!response.ok) {
            let errorText = 'Could not retrieve error text.';
            try {
                // Check response exists and text() is a function before calling
                if (response && typeof response.text === 'function') {
                    errorText = await response.text();
                }
            } catch (textError) {
                 console.error('[ods] fetchData: Error getting text from error response:', textError);
            }
             // Use string concatenation ONLY for the error message
             throw new Error('HTTP error! status: ' + status + '. Body: ' + errorText);
        }

        // Parse the JSON
        const jsonData = await response.json();
        console.log('[ods] fetchData: JSON data parsed.');

        // Check if it's an array
        if (Array.isArray(jsonData)) {
            console.log('[ods] fetchData: Data is array. Length:', jsonData.length);
            // Return the actual data array
            return jsonData;
        } else {
            console.error("[ods] fetchData: Unexpected JSON structure (expected array):", jsonData);
            // Use string concatenation ONLY for the error message
            throw new Error("Expected a JSON array, received other type.");
        }

    } catch (error) {
        // Log the error encountered within fetchData
        console.error("[ods] fetchData: Error during async operation:", error.message);
        // Re-throw the error so the top-level await catches it
        throw error;
    }
};

// --- Top-Level Await Section ---
console.log('[ods] Preparing for top-level await...');
let data; // Declare data variable
try {
    // Use top-level await HERE to wait for the fetch to complete
    data = await fetchData();
    // This log should only appear if fetchData() resolves successfully
    console.log('[ods] Top-level await successful. Data variable is now assigned.');
} catch(tla_error) {
    // Log the error caught by the top-level await
    console.error('[ods] Top-level await failed:', tla_error.message);
    // Decide how to handle failure: assign empty array or re-throw?
    // Re-throwing ensures Evidence knows the source failed.
    // Assigning empty array might hide problems but allow build to continue.
    // Let's re-throw for clarity:
    throw new Error('Failed to fetch data for source ods: ' + tla_error.message);
}
// -----------------------------

// Export the 'data' variable.
// Because we used top-level await, 'data' should now hold the actual array.
// We must use 'export { data };' because 'data' is assigned after declaration.
export { data };

console.log('[ods] Script initial execution finished. Data exported.');