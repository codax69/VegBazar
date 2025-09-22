export const apiCall = async (orderData) => {
  try {
    await fetch(
      "https://script.google.com/macros/s/AKfycbyP1AqOxvz7wSR96cteL6Q8bZkHVimI3Jh3xmjB7WX13lpFzqNrcFxhWPzaN7AuEj11qg/exec",
      {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      }
    );

    return { success: true };
  } catch (error) {
    console.error("Error submitting to Google Sheets:", error);
    return { success: false, error };
  }
};
