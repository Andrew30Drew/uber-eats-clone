import axios from "axios";

const API_URL = "http://localhost:30006"; // Restaurant service URL

// Set auth header
const setAuthHeader = () => {
  const token = localStorage.getItem("token");
  if (token) {
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }
};

export const uploadImage = async (imageFile: File) => {
  setAuthHeader();
  try {
    console.log(
      `Uploading image: ${imageFile.name}, size: ${imageFile.size} bytes, type: ${imageFile.type}`
    );

    // Create FormData object for file upload
    const formData = new FormData();
    formData.append("image", imageFile);

    // Make POST request to upload the image
    const response = await axios.post(
      `${API_URL}/restaurants/upload-image`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    console.log(`Image upload successful: ${response.data.imagePath}`);
    return response.data.imagePath;
  } catch (error: any) {
    console.error("Error uploading image:", error);
    if (error.response) {
      console.error(
        "Server response error:",
        error.response.status,
        error.response.data
      );
    }
    throw error;
  }
};
