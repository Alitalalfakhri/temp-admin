'use client'
import { useState, useEffect } from "react";
import axios from "axios";
import "../styles/media.css";
import { API_URL } from "../lib";
import Link from 'next/link';
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Media() {

  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/auth/check`, {
          withCredentials: true,
        });

        if (!res.data.authenticated) {
          router.push('/');
        }
      } catch (err) {
        console.log('Not authenticated', err);
        router.push('/');
      }
    };

    checkAuth();
  }, [router]);

  const [videoUrl, setVideoUrl] = useState("");
  const [videoType, setVideoType] = useState("review");
  const [description, setDescription] = useState("");
  const [role, setRole] = useState("");
  const [company, setCompany] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState(""); // ✅ NEW: factory video title

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [reviewVideos, setReviewVideos] = useState([]);
  const [factoryVideos, setFactoryVideos] = useState([]);
  const [images, setImages] = useState([]);
  const [imageTitle, setImageTitle] = useState("");
  const [activeVideo, setActiveVideo] = useState(null);

  useEffect(() => {
    async function fetchImages() {
      try {
        const res = await axios.get(`${API_URL}/api/images`);
        setImages(res.data);
      } catch (err) {
        console.error(err);
      }
    }
    fetchImages();
  }, []);

  useEffect(() => {
    async function fetchReviews() {
      try {
        const res = await axios.get(`${API_URL}/api/reviews/videos`);
        setReviewVideos(res.data);
      } catch (err) {
        console.error(err);
      }
    }
    fetchReviews();
  }, []);

  useEffect(() => {
    async function fetchFactory() {
      try {
        const res = await axios.get(`${API_URL}/api/factory/videos`);
        setFactoryVideos(res.data);
      } catch (err) {
        console.error(err);
      }
    }
    fetchFactory();
  }, []);

  const getYoutubeId = (url) => {
    try {
      const parsed = new URL(url);

      if (parsed.pathname.includes("/shorts/")) {
        return parsed.pathname.split("/shorts/")[1].split("/")[0];
      }
      if (parsed.hostname === "youtu.be") {
        return parsed.pathname.slice(1);
      }
      if (parsed.searchParams.get("v")) {
        return parsed.searchParams.get("v");
      }
      if (parsed.pathname.includes("/embed/")) {
        return parsed.pathname.split("/embed/")[1];
      }
      return null;
    } catch {
      return null;
    }
  };

  const getThumbnail = (id) =>
    `https://img.youtube.com/vi/${id}/hqdefault.jpg`;

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
      const body = { videoUrl, videoType };

      if (videoType === "review") {
        body.description = description;
        body.role = role;
        body.company = company;
      }

      // ✅ NEW: include title for factory videos
      if (videoType === "factory") {
        body.title = title;
      }

      const res = await axios.post(`${API_URL}/api/add/video`, body, {
        withCredentials: true,
      });

      alert(res.data.message);
      setVideoUrl("");
      setThumbnail("");
      setDescription("");
      setRole("");
      setCompany("");
      setTitle(""); // ✅ NEW: clear title after submit
    } catch (err) {
      alert(err.response?.data?.message || "حدث خطأ أثناء إضافة الفيديو");
    } finally {
      setLoading(false);
      window.location.reload();
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
      formData.append("title", imageTitle);

      const res = await axios.post(`${API_URL}/api/add/image`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });

      alert(res.data.message);
      setImagePreview(null);
      setImageFile(null);
      setImageTitle("");
    } catch (err) {
      alert(err.response?.data?.message || "حدث خطأ أثناء رفع الصورة");
    } finally {
      setImageLoading(false);
      window.location.reload();
    }
  };

  const handelVideoDelete = async (videoId) => {
    try {
      setLoading(true);
      const res = await axios.delete(`${API_URL}/api/delete/video/${videoId}`, {
        withCredentials: true,
      });
      alert(res.data.message);
      setLoading(false);
    } catch (err) {
      alert(err.response?.data?.message || "حدث خطأ أثناء حذف الفيديو");
      setLoading(false);
      
    }
    finally{
      window.location.reload();
    }
  };

  const handelImageDelete = async (imageId) => {
    try {
      setLoading(true);
      const res = await axios.delete(`${API_URL}/api/delete/image/${imageId}`, {
        withCredentials: true,
      });
      alert(res.data.message);
      setLoading(false);
    } catch (err) {
      alert(err.response?.data?.message || "حدث خطأ أثناء حذف الصورة");
      console.log(err);
      setLoading(false);
    }
    finally{
      window.location.reload();
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

          {/* ✅ NEW: title field shown only for factory videos */}
          {videoType === "factory" && (
            <>
              <label>عنوان الفيديو</label>
              <input
                type="text"
                placeholder="أدخل عنوان الفيديو"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
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

        {/* ================= REVIEW VIDEOS LIST ================= */}
        <h2>فيديوهات المراجعة</h2>
        {reviewVideos.map((review, index) => {
          const videoId = review.videoId || getYoutubeId(review.videoUrl);
          if (!videoId) return null;

          return (
            <div className="card" key={index}>
              <div className="videoWrapper">
                {activeVideo === `review-${index}` ? (
                  <>
                    <button
                      className="closeBtn"
                      onClick={() => setActiveVideo(null)}
                      aria-label="إغلاق الفيديو"
                    >
                      ✕
                    </button>
                    <iframe
                      src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
                      allow="autoplay; encrypted-media; fullscreen"
                      allowFullScreen
                      loading="lazy"
                      className="iframe"
                      title={review.company || "فيديو"}
                    />
                  </>
                ) : (
                  <div
                    className="thumbnail"
                    onClick={() => setActiveVideo(`review-${index}`)}
                  >
                    <Image
                      src={getThumbnail(videoId)}
                      alt={review.company || "فيديو"}
                      fill
                      sizes="(max-width:768px) 100vw, 33vw"
                      className="image"
                      priority={false}
                    />
                    <div className="playBtn">▶</div>
                  </div>
                )}
              </div>

              <div className="cardContent">
                <div className="stars">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span
                      key={i}
                      style={{ color: "orange", fontSize: "20px", fontWeight: "bold" }}
                    >
                      ★
                    </span>
                  ))}
                </div>

                {(review.comment || review.description) && (
                  <p className="comment">
                    "{review.comment || review.description}"
                  </p>
                )}

                <p className="meta">
                  {review.role ? review.role : ""}
                  {review.role && review.company ? " - " : ""}
                  {review.company ? review.company : ""}
                </p>
              </div>

              <button onClick={() => handelVideoDelete(review._id)}>
                {loading ? "جاري الحذف..." : "حذف الفيديو"}
              </button>
            </div>
          );
        })}

        {/* ================= FACTORY VIDEOS LIST ================= */}
        <h2>فيديوهات المكتبة / المعمل</h2>
        {factoryVideos.map((video, index) => {
          const videoId = video.videoId || getYoutubeId(video.videoUrl);
          if (!videoId) return null;

          return (
            <div className="card" key={index}>
              <div className="videoWrapper">
                {activeVideo === `factory-${index}` ? (
                  <>
                    <button
                      className="closeBtn"
                      onClick={() => setActiveVideo(null)}
                      aria-label="إغلاق الفيديو"
                    >
                      ✕
                    </button>
                    <iframe
                      src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
                      allow="autoplay; encrypted-media; fullscreen"
                      allowFullScreen
                      loading="lazy"
                      className="iframe"
                      title={video.title || "فيديو"}
                    />
                  </>
                ) : (
                  <div
                    className="thumbnail"
                    onClick={() => setActiveVideo(`factory-${index}`)}
                  >
                    <Image
                      src={getThumbnail(videoId)}
                      alt={video.title || "فيديو"}
                      fill
                      sizes="(max-width:768px) 100vw, 33vw"
                      className="image"
                      priority={false}
                    />
                    <div className="playBtn">▶</div>
                  </div>
                )}
              </div>

              <div className="cardContent">
                {/* ✅ NEW: display factory video title */}
                {video.title && (
                  <p className="meta"><strong>{video.title}</strong></p>
                )}
              </div>

              <button onClick={() => handelVideoDelete(video._id)}>
                {loading ? "جاري الحذف..." : "حذف الفيديو"}
              </button>
            </div>
          );
        })}
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
          <label>عنوان الصورة</label>
          <input
            type="text"
            placeholder="أدخل عنوان الصورة"
            value={imageTitle}
            onChange={(e) => setImageTitle(e.target.value)}
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

        {images.map((image, i) => {
          return (
            <div className="iamges-map" key={i}>
              <div>
                <Image
                  src={image.imageUrl}
                  alt={image.title || ''}
                  width={50}
                  height={50}
                  className="image"
                  priority={false}
                />
                <button onClick={() => handelImageDelete(image._id)}>
                  {loading ? "جاري الحذف..." : "حذف الصورة"}
                </button>
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
}