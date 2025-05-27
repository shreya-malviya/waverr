import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import getCroppedImg from './cropImage';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { ArrowLeft, Upload } from 'lucide-react'; // Lucide icons for back/upload
import Loading from '../../../loading/Loading';
import api, { BASE_URL } from '../../../util';

function UploadImage() {
  const { user } = useSelector((state) => state.user);
  const navigate = useNavigate();

  const [image, setImage] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [caption, setCaption] = useState('');
  const [location, setLocation] = useState('');
  const [loading,setLoading] = useState(false);

  const onCropComplete = useCallback((_, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handlePost = async () => {
    if (!image || !croppedAreaPixels) return alert("Please upload and crop an image first.");

    const croppedImage = await getCroppedImg(image, croppedAreaPixels);
    
    try {
      setLoading(true)
      const formData = new FormData();
formData.append('image', croppedImage); // this is a base64 string
formData.append('caption', caption);
formData.append('location', location);
formData.append('userId', user?._id);
      const res = await api.post(`/api/v1/post/upload`, formData, {
  headers: {
    "Content-Type": "multipart/form-data",
  },
});
      navigate(`/profile/${user?._id}`);
    } catch (err) {
      console.error('Upload failed:', err);
    }finally{
      setLoading(false);
    }
  };

  return (
    <>
    {loading? (<div className='flex-1 h-[90vh] justify-center items-center'><Loading/> </div>):(
      <div className="md:mt-10 mt-16 px-4 flex flex-col gap-8 overflow-auto">
      

      {/* MAIN CONTENT */}
      <div className="flex flex-col lg:flex-row gap-8">

        {/* IMAGE PREVIEW + SLIDER */}
        <div className="flex flex-col gap-4 w-full lg:w-2/3">
          <div className="relative w-full aspect-[3/2] bg-gray-200 rounded-xl overflow-hidden shadow-lg">
            {image ? (
              <Cropper
                image={image}
                crop={crop}
                zoom={zoom}
                aspect={3 / 2}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-gray-500">
                Preview area (3:2)
              </div>
            )}
          </div>
          {image && (
            <div className="flex justify-center">
              <input
                type="range"
                min={1}
                max={3}
                step={0.1}
                value={zoom}
                onChange={(e) => setZoom(e.target.value)}
                className="w-64"
              />
            </div>
          )}
        </div>
          
        {/* FORM SECTION */}
          {/* FORM SECTION */}
<div className="w-full lg:w-1/3 relative flex flex-col gap-4">
  {/* TOP CONTROLS: BACK + UPLOAD */}
  <div className="flex flex-wrap gap-4 mb-4 md:mb-20 md:justify-start justify-center items-center">
    <button
      onClick={() => navigate(`/profile/${user?._id}`)}
      className="flex items-center gap-2 bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded"
    >
      <ArrowLeft size={18} /> Back
    </button>

    <label className="cursor-pointer flex items-center gap-2 bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700">
      <Upload size={18} /> Upload Image
      <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
    </label>
  </div>

  {/* CAPTION, LOCATION, POST — STICK TO BOTTOM ON LARGE SCREENS */}
  <div className="flex flex-col gap-3 md:absolute md:bottom-0 md:left-0 md:right-0 md:p-4 bg-white md:shadow-lg">
    <input
      type="text"
      placeholder="Caption?"
      value={caption}
      onChange={(e) => setCaption(e.target.value)}
      className="border rounded px-3 py-2 w-full"
    />
    <input
      type="text"
      placeholder="Location?"
      value={location}
      onChange={(e) => setLocation(e.target.value)}
      className="border rounded px-3 py-2 w-full"
    />
    <button
      onClick={handlePost}
      className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded"
    >
      Post
    </button>
  </div>
</div>

      </div>
    </div>
    )}
    </>
    
  );
}

export default UploadImage;
