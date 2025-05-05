// Mock SMS gateway implementation
export const sendSMS = async ({ recipient, message }) => {
  try {
    // Log the SMS details (for development/testing)
    console.log("Sending SMS:", {
      to: recipient,
      message: message,
    });

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Mock successful response
    const mockResponse = {
      success: true,
      messageId: `SMS_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
    };

    console.log("SMS sent successfully:", mockResponse);
    return mockResponse;
  } catch (error) {
    console.error("Error sending SMS:", error);
    throw new Error("Failed to send SMS");
  }
};
