import React from 'react'

function AddImage({setImage,image}) {
      const fileInputRef = useRef(null);
  return (
    <div className="relative flex items-center">
    <input
      type="file"
      accept="image/*"
      style={{ display: 'none' }}
      ref={fileInputRef}
      onChange={(e) => {
        const file = e.target.files[0];
        if (file) {
          setImage(URL.createObjectURL(file)); // for preview
          // optionally, upload or store file for sending
        }
      }}
    />
    <FiPaperclip
      className="cursor-pointer text-white text-xl"
      onClick={() => fileInputRef.current.click()}
    />
  </div>
  )
}

export default AddImage