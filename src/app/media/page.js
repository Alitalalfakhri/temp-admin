'use client'
import { useState } from "react";
import axios from "axios";
import "../styles/media.css";
import { API_URL } from "../lib";
import Link from 'next/link';


export default function Media() {
  const [videoUrl, setVideoUrl] = useState("");
  const [videoType, setVideoType] = useState("review");
  const [description, setDescription] = useState("");
  const [role, setRole] = useState("");
  const [company, setCompany] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [loading, setLoading] = useState(false);

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageLoading, setImageLoading] = useState(false);

  // ✅ Universal YouTube ID extractor (supports Shorts)
  const getYoutubeId = (url) => {
    try {
      const parsed = new URL(url);

      // Shorts
      if (parsed.pathname.includes("/shorts/")) {
        return parsed.pathname.split("/shorts/")[1].split("/")[0];
      }

      // youtu.be
      if (parsed.hostname === "youtu.be") {
        return parsed.pathname.slice(1);
      }

      // watch?v=
      if (parsed.searchParams.get("v")) {
        return parsed.searchParams.get("v");
      }

      // embed
      if (parsed.pathname.includes("/embed/")) {
        return parsed.pathname.split("/embed/")[1];
      }

      return null;
    } catch {
      return null;
    }
  };

  const handleVideoChange = (url) => {
    setVideoUrl(url);
    const id = getYoutubeId(url);
    if (id) {
      setThumbnail(`https://img.youtube.com/vi/${id}/hqdefault.jpg`);
    } else {
      setThumbnail("");
    }
  };

  const handleAddVideo = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const body = {
        videoUrl,
        videoType,
      };

      if (videoType === "review") {
        body.description = description;
        body.role = role;
        body.company = company;
      }

      const res = await axios.post(`${API_URL}/api/add/video`, body , {
        withCredentials: true
      } ) ;

      alert(res.data.message);

      // reset
      setVideoUrl("");
      setThumbnail("");
      setDescription("");
      setRole("");
      setCompany("");
    } catch (err) {
      alert(err.response?.data?.message || "حدث خطأ أثناء إضافة الفيديو");
    } finally {
      setLoading(false);
    }
  };

  const handleImagePreview = (file) => {
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleAddImage = async (e) => {
    e.preventDefault();
    setImageLoading(true);

    try {
      const formData = new FormData();
      formData.append("image", imageFile);

      const res = await axios.post(`${API_URL}/api/add/image`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      } , {
        withCredentials: true
      });

      alert(res.data.message);
      setImagePreview(null);
      setImageFile(null);
    } catch (err) {
      alert(err.response?.data?.message || "حدث خطأ أثناء رفع الصورة");
    } finally {
      setImageLoading(false);
    }
  };

  return (
         <div className="media-page" dir="rtl">
        <div className="header">
        <h1 className="header-title">إدارة الوسائط</h1>

        <Link href="/home" className="home-btn">
            العودة إلى الرئيسية
        </Link>
        </div>
      {/* ================= VIDEO SECTION ================= */}
      <section className="card">
        <h2>إضافة فيديو يوتيوب</h2>

        <form onSubmit={handleAddVideo}>
          <label>رابط الفيديو</label>
          <input
            type="text"
            placeholder="ضع رابط يوتيوب (يدعم الشورتس)"
            value={videoUrl}
            onChange={(e) => handleVideoChange(e.target.value)}
            required
          />

          <label>نوع الفيديو</label>
          <select
            value={videoType}
            onChange={(e) => setVideoType(e.target.value)}
          >
            <option value="review">مراجعة عميل</option>
            <option value="factory">فيديو مكتبة / معمل</option>
          </select>

          {videoType === "review" && (
            <>
              <label>الوصف</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                
              />

              <label>الوظيفة</label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              />

              <label>الشركة</label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
              />
            </>
          )}

          {thumbnail && (
            <div className="preview">
              <img src={thumbnail} alt="معاينة الفيديو" />
            </div>
          )}

          <button type="submit" disabled={loading}>
            {loading ? "جاري الإضافة..." : "إضافة الفيديو"}
          </button>
        </form>
      </section>

      {/* ================= IMAGE SECTION ================= */}
      <section className="card">
        <h2>إضافة صورة إلى المكتبة</h2>

        <form onSubmit={handleAddImage}>
          <label>اختر صورة</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleImagePreview(e.target.files[0])}
            required
          />

          {imagePreview && (
            <div className="preview">
              <img src={imagePreview} alt="معاينة الصورة" />
            </div>
          )}

          <button type="submit" disabled={imageLoading}>
            {imageLoading ? "جاري الرفع..." : "إضافة الصورة"}
          </button>
        </form>
      </section>
    </div>
  );
}