
import { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import Loading from "../../../loading/Loading";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { loadUser } from "../../../action/userAction";
import api, { BASE_URL } from "../../../util";

const ProfileEdit = () => {
  const [formData, setFormData] = useState(null);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const {user,isAuthenticated} = useSelector((state)=>state.user)
  const navigate = useNavigate();
  useEffect(() => {
    if(!user || !isAuthenticated) return;
    const fetchProfile = async () => {
      try {
        setLoading(true)
        const res = await api.get(`/api/v1/myProfile`);

        const { user, profile } = res.data;
        const userProfile = profile[0];

        setFormData({
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          avatar: user.avatar?.url || "",
          profileName: userProfile.profileName || "",
          bio: userProfile.bio || "",
          location: userProfile.location || "",
          birthday: userProfile.birthday
            ? userProfile.birthday.substring(0, 10)
            : "",
          gender: userProfile.gender || "other",
          statusText: userProfile.statusText || "",
          profileVisibility: userProfile.profileVisibility || "public",
        });
      } catch (error) {
        toast.error("Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSave = async () => {
    try {
      setLoading(true)
      await api.put(`/api/v1/updateMe`, formData, {
        headers: {
    "Content-Type": "multipart/form-data" // optional, browser usually sets this
  }
      });
      toast.success("Profile updated successfully!");
      dispatch(loadUser());
      navigate(`/profile/${user._id}`)
    } catch (err) {
      toast.error("Failed to update profile.");
      console.log("error",err)
    }
    finally{
      setLoading(false)
    }
  };

  if (loading || !formData) return <div className="text-center p-4 h-[90vh] w-full justify-center items-center"> <Loading/> </div>;

  return (
    <>
    {loading? (<div className='flex-1 h-[90vh] justify-center items-center'><Loading/> </div>):(
    <div className="max-w-3xl mx-auto p-6 rounded-lg shadow-md h-[100vh] overflow-y-scroll">
      {/* Avatar Section */}
       {/* Back Button */}
  <button
    onClick={() => navigate(`/profile/${user._id}`)}
    className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors font-semibold"
  >
    <span className="text-xl">←</span> Back
  </button>
      <div className="flex flex-col items-center mb-10">
        <div className="relative w-32 h-32">
          <img
            src={formData.avatar}
            alt="Avatar"
            className="w-full h-full rounded-full object-cover border"
          />
          <label className="absolute bottom-0 right-0 p-2 bg-black/50 text-white rounded-full cursor-pointer">
            ✎
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files[0];
if (file) {
  // Image preview
  const previewUrl = URL.createObjectURL(file);

  // Convert to base64 for backend
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onloadend = () => {
    const base64Data = reader.result;
    setFormData({ 
      ...formData,
      avatar: base64Data, // used for backend
      avatarPreview: previewUrl // used for preview
    });
  };
}

              }}
            />
          </label>
        </div>
      </div>

      {/* Name Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <input
          type="text"
          placeholder="First Name"
          value={formData.firstName}
          onChange={(e) =>
            setFormData({ ...formData, firstName: e.target.value })
          }
          className="input input-bordered w-full"
        />
        <input
          type="text"
          placeholder="Last Name"
          value={formData.lastName}
          onChange={(e) =>
            setFormData({ ...formData, lastName: e.target.value })
          }
          className="input input-bordered w-full"
        />
      </div>

      {/* Other fields */}
      <input
        type="text"
        placeholder="Profile Name"
        value={formData.profileName}
        onChange={(e) =>
          setFormData({ ...formData, profileName: e.target.value })
        }
        className="input input-bordered w-full mb-4"
      />

      <textarea
        placeholder="Bio"
        value={formData.bio}
        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
        className="textarea textarea-bordered w-full mb-4"
        maxLength={160}
      />

      <input
        type="text"
        placeholder="Location"
        value={formData.location}
        onChange={(e) =>
          setFormData({ ...formData, location: e.target.value })
        }
        className="input input-bordered w-full mb-4"
      />

      <input
        type="date"
        value={formData.birthday}
        onChange={(e) =>
          setFormData({ ...formData, birthday: e.target.value })
        }
        className="input input-bordered w-full mb-4"
      />

      <select
        value={formData.gender}
        onChange={(e) =>
          setFormData({ ...formData, gender: e.target.value })
        }
        className="select select-bordered w-full mb-4"
      >
        <option value="other">Other</option>
        <option value="male">Male</option>
        <option value="female">Female</option>
      </select>

      <input
        type="text"
        placeholder="Status (1-20 chars)"
        value={formData.statusText}
        onChange={(e) =>
          setFormData({ ...formData, statusText: e.target.value })
        }
        className="input input-bordered w-full mb-4"
        maxLength={20}
      />

      {/* Private / Public toggle */}
      <div className="flex items-center justify-between mb-6 pr-4">
        <label className="label">Private Account</label>
        <input
          type="checkbox"
          checked={formData.profileVisibility === "private"}
          onChange={(e) =>
            setFormData({
              ...formData,
              profileVisibility: e.target.checked ? "private" : "public",
            })
          }
          className="toggle toggle-primary"
        />
      </div>

      <button
        onClick={handleSave}
        className="btn btn-primary w-full"
        disabled={loading}
      >
        {loading ? "Saving..." : "Save Profile"}
      </button>
    </div>)}
    <ToastContainer position="top-center" autoClose={2000} />
    </>
  );
};

export default ProfileEdit;
