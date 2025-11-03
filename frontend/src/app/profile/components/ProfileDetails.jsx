"use client";

import { useSelector, useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { getAuthToken } from "@/utils/postApi";
import { authSuccess } from "@/redux/slices/authSlice";

const ProfileDetails = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    website: "",
    location: "",
    github: "",
    image: null, // for file upload
  });

  const [photoPreview, setPhotoPreview] = useState("/default-avatar.png");
  const [loading, setLoading] = useState(false);

  const token = getAuthToken();

  useEffect(() => {
    if (!userInfo?._id || !token) return;

    const fetchProfile = async () => {
      try {
        const { data } = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/users/profile/me`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setFormData((prev) => ({
          ...prev,
          name: data.user.name || "",
          bio: data.user.bio || "",
          website: data.user.website || "",
          location: data.user.location || "",
          github: data.user.github || "",
        }));

        setPhotoPreview(data.user.profilePicture || "/default-avatar.png");
      } catch (error) {
        console.error("Failed to fetch profile:", error);
        toast.error("Failed to load profile");
      }
    };

    fetchProfile();
  }, [userInfo, token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("bio", formData.bio);
      data.append("website", formData.website);
      data.append("location", formData.location);
      data.append("github", formData.github);

      if (formData.image) data.append("image", formData.image); // must match multer field

      const res = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/users/profile-update`,
        data,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.data?.success) {
        toast.success(res.data.message || "Profile updated successfully!");
        dispatch(authSuccess(res.data.user));
      } else {
        toast.error("Profile update failed!");
      }
    } catch (error) {
      console.error("Profile update failed:", error);
      toast.error(error.response?.data?.message || "Profile update failed!");
    } finally {
      setLoading(false);
    }
  };

  if (!userInfo) return <div className="text-center py-10">Loading...</div>;

  return (
    <div className="max-w-xl mx-auto mt-10 space-y-6">
      <h2 className="text-2xl font-semibold border-b pb-2">Your Profile</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profile Image */}
        <div className="flex items-center space-x-4">
          <img
            src={photoPreview}
            alt="Profile"
            className="w-16 h-16 rounded-full object-cover border-2 border-indigo-300"
          />
          <input type="file" accept="image/*" onChange={handleImageChange} />
        </div>

        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Name
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md"
          />
        </div>

        {/* Bio */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Bio</label>
          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            rows="3"
            maxLength="500"
            className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md"
          />
        </div>

        {/* Website / Location / GitHub */}
        {["website", "location", "github"].map((field) => (
          <div key={field}>
            <label className="block text-sm font-medium text-gray-700">
              {field.charAt(0).toUpperCase() + field.slice(1)}
            </label>
            <input
              type={field === "website" ? "url" : "text"}
              name={field}
              value={formData[field]}
              onChange={handleChange}
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md"
            />
          </div>
        ))}

        {/* Role (read-only) */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Account Role
          </label>
          <input
            type="text"
            value={userInfo.role}
            readOnly
            className="w-full px-3 py-2 mt-1 border border-gray-300 bg-gray-100 rounded-md cursor-not-allowed"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 px-4 rounded-md bg-indigo-600 text-white hover:bg-indigo-700"
        >
          {loading ? "Saving..." : "Update Profile"}
        </button>
      </form>
    </div>
  );
};

export default ProfileDetails;
