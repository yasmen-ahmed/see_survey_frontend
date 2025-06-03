import React, { useState } from 'react';

const ImageUploader = ({images}) => {
  const [imagePreviews, setImagePreviews] = useState({});

  const handleInputChange = (e) => {
    const file = e.target.files[0];
    const name = e.target.name;

    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews((prev) => ({
          ...prev,
          [name]: reader.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="grid grid-cols-1 w-[20%] h-[858px] bg-white rounded-xl shadow-md p-5 overflow-y-auto">
      {images.map((field) => (
        <div key={field.name} className="flex flex-col pb-5">
          <label className="font-semibold mb-1">{field.label}</label>
          {imagePreviews[field.name] ? (
            <img
              src={imagePreviews[field.name]}
              alt={`${field.label} Preview`}
              className="border p-2 rounded-md h-50 w-full object-cover"
            />
          ) : (
            <input
              type="file"
              name={field.name}
              accept="image/*"
              onChange={handleInputChange}
              className="border p-2 rounded-md h-50 w-full"
            />
          )}
        </div>
      ))}
    </div>
  );
};

export default ImageUploader;
