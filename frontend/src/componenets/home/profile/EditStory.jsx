import React, { useState } from "react";
import axios from "axios";
import Loading from "../../../loading/Loading";
import api, { BASE_URL } from "../../../util";
import { toast } from "react-toastify";

function EditStory({ onClose }) {
    const [file, setFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState("");
    const [base64, setBase64] = useState(null);
    const [loading,setLoading] = useState(false);
    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setPreviewUrl(URL.createObjectURL(selectedFile));
        }
        const reader = new FileReader();

        reader.readAsDataURL(selectedFile); // convert to base64
        reader.onloadend = () => {
            const base64Data = reader.result; // this is what you send to backend

            setFile(selectedFile);
            setBase64(base64Data);  // required for backend
        };

    };

    const handleUpload = async () => {
        if (!file) return;
        
        const formData = new FormData();
        formData.append("story", base64); // Send the raw File object here

        try {
            setLoading(true)
            const res = await api.post(`/api/v1/post/story`,formData, {
                headers: { "Content-Type": "multipart/form-data" },
                withCredentials: true,
            });
            toast.success("story uploaded successfully ")
            if (res.status === 200) {
                onClose();
            } else {
                console.error("Upload failed with status:", res.status);
            }
        } catch (error) {
            console.error("Upload failed", error);
        }finally{
            setLoading(false)
        }
    };

    return (
        <>
        {loading? (<div className='flex-1 h-[90vh] justify-center items-center'><Loading/> </div>):(<div className="fixed inset-0 z-50 bg-black bg-opacity-70 flex justify-center items-center">
            <div className="bg-white w-[360px] h-[640px] md:h-[600px] rounded-lg shadow-lg p-4 pt-8 relative flex flex-col">
                <button
                    className="absolute top-2 right-2 text-gray-600 hover:text-black"
                    onClick={onClose}
                >
                    ✕
                </button>

                <label className="flex-1 border-2 border-dashed border-gray-300 flex justify-center items-center cursor-pointer rounded overflow-hidden">
                    <input
                        type="file"
                        accept="image/*" // Only allow images now
                        className="hidden"
                        onChange={handleFileChange}
                    />
                    {previewUrl ? (
                        <img
                            src={previewUrl}
                            alt="preview"
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <p className="text-gray-500 text-center">Click to upload an image</p>
                    )}
                </label>

                <button
                    className="mt-4 bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                    onClick={handleUpload}
                >
                    Upload Story
                </button>
            </div>
        </div>)}
        </>
        
    );
}

export default EditStory;
