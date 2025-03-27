import axios from "axios";

export const uploadImage = async (image) => {
  // remove cloud name dow2v8iub
  const cloudinaryURL =
    "https://api.cloudinary.com/v1_1/dow2v8iub/image/upload";
  const formData = new FormData();
  formData.append("file", image);
  formData.append("upload_preset", "jockalois_enterprise");

  return axios
    .post(cloudinaryURL, formData)
    .then((res) => {
      return res.data.url;
    })
    .catch((err) => console.log(err));
};
