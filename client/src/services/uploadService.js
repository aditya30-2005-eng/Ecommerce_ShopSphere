import api from './api';

// Uploads one or more image files (FileList/File[]) and returns their
// public URLs. Axios sets the multipart boundary automatically as long as
// we don't set a Content-Type header ourselves.
const uploadImages = (files) => {
  const formData = new FormData();
  Array.from(files).forEach((file) => formData.append('images', file));
  return api.post('/upload', formData).then((res) => res.data);
};

export default { uploadImages };
