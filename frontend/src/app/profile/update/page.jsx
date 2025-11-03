"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import useAuth from "@/hooks/useAuth";

export default function ProfileUpdatePage() {
  const { user, setUser, token } = useAuth();
  console.log("User-Token", user, token);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    occupation: "",
    bio: "",
    instagram: "",
    facebook: "",
    linkedin: "",
    github: "",
    image: null, // For uploaded file
  });
  const [photoPreview, setPhotoPreview] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    axios
      .get(`${process.env.NEXT_PUBLIC_API_URL}/api/user/profile/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        if (res.data.user) {
          const u = res.data.user;
          setFormData({
            firstName: u.firstName || "",
            lastName: u.lastName || "",
            occupation: u.occupation || "",
            bio: u.bio || "",
            instagram: u.instagram || "",
            facebook: u.facebook || "",
            linkedin: u.linkedin || "",
            github: u.github || "",
            image: null,
          });
          setPhotoPreview(u.photoUrl || "");
        }
      })
      .catch((err) => {
        console.error(err);
        toast.error("Failed to fetch profile");
      });
  }, [user]);

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
    console.log(token, user);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = new FormData();
      Object.keys(formData).forEach((key) => {
        if (formData[key]) {
          if (key === "image") data.append("image", formData.image);
          else data.append(key, formData[key]);
        }
      });
      for (let pair of data.entries()) {
        console.log(pair[0], pair[1]);
      }

      const res = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/user/profile/update`,
        data,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("After Profile Update Api Call: ", res);

      if (res.data.success) {
        toast.success("Profile updated!");
        setUser((prev) => ({
          ...prev,
          firstName: res.data.user.firstName,
          lastName: res.data.user.lastName,
          photoUrl: res.data.user.photoUrl,
        }));
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto my-12 p-6 bg-white shadow rounded">
      <h2 className="text-2xl font-semibold mb-6">Update Profile</h2>
      <form
        onSubmit={handleSubmit}
        className="space-y-4"
        encType="multipart/form-data"
      >
        <div className="flex items-center gap-4">
          <img
            src={photoPreview || "/default-avatar.png"}
            alt="Preview"
            className="w-20 h-20 rounded-full object-cover"
          />
          <input
            type="file"
            name="image"
            accept="image/*"
            onChange={handleImageChange}
          />
        </div>

        <input
          type="text"
          name="firstName"
          value={formData.firstName}
          onChange={handleChange}
          placeholder="First Name"
          className="border p-2 rounded w-full"
        />
        <input
          type="text"
          name="lastName"
          value={formData.lastName}
          onChange={handleChange}
          placeholder="Last Name"
          className="border p-2 rounded w-full"
        />
        <input
          type="text"
          name="occupation"
          value={formData.occupation}
          onChange={handleChange}
          placeholder="Occupation"
          className="border p-2 rounded w-full"
        />
        <textarea
          name="bio"
          value={formData.bio}
          onChange={handleChange}
          placeholder="Bio"
          className="border p-2 rounded w-full h-24"
        />

        {/* Social links */}
        <input
          type="text"
          name="instagram"
          value={formData.instagram}
          onChange={handleChange}
          placeholder="Instagram URL"
          className="border p-2 rounded w-full"
        />
        <input
          type="text"
          name="facebook"
          value={formData.facebook}
          onChange={handleChange}
          placeholder="Facebook URL"
          className="border p-2 rounded w-full"
        />
        <input
          type="text"
          name="linkedin"
          value={formData.linkedin}
          onChange={handleChange}
          placeholder="LinkedIn URL"
          className="border p-2 rounded w-full"
        />
        <input
          type="text"
          name="github"
          value={formData.github}
          onChange={handleChange}
          placeholder="GitHub URL"
          className="border p-2 rounded w-full"
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
        >
          {loading ? "Updating..." : "Update Profile"}
        </button>
      </form>
    </div>
  );
}
