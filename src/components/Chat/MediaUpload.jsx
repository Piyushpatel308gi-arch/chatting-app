import { forwardRef } from 'react';
import { uploadMedia } from '../../cloudinary';

const MediaUpload = forwardRef(({ onUpload, mediaType }, ref) => {
  const acceptMap = {
    photo: 'image/*',
    video: 'video/*',
    audio: 'audio/*',
  };

  const handleChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = await uploadMedia(file, file.type);
    onUpload(mediaType, url);
    e.target.value = null; // reset
  };

  return (
    <input
      type="file"
      accept={acceptMap[mediaType]}
      ref={ref}
      style={{ display: 'none' }}
      onChange={handleChange}
    />
  );
});

export default MediaUpload;