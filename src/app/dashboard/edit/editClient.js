'use client'

import { use, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { API_URL } from "@/app/lib";
import "@/app/styles/edit.css";
import axios from "axios";
import Link from "next/link";

export default function EditProductClient() {
  const router = useRouter();

  // ---------------- AUTH CHECK ----------------
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

  const searchParams = useSearchParams();
  const id = searchParams.get('id');

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [sizes, setSizes] = useState([]);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading , setLoading] = useState(false);

  // -------- FETCH PRODUCT --------
  useEffect(() => {
    if (!id) return;

    const fetchProduct = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/product/${id}`);
        const data = res.data;

        setTitle(data.title);
        setDescription(data.description);
        setSizes(data.sizes || []);
        setPreview(data.imageLink);
      } catch (error) {
        console.error("Failed to fetch product:", error);
      }
    };

    fetchProduct();
  }, [id]);

  // -------- IMAGE --------
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setImage(null);
    setPreview(null);
  };

  // -------- SIZES --------
  const handleSizeChange = (index, field, value) => {
    const updated = [...sizes];
    updated[index][field] = value;
    setSizes(updated);
  };

  const addSize = () => setSizes([...sizes, { width: "", height: "", price: "" }]);
  const removeSize = (index) => setSizes(sizes.filter((_, i) => i !== index));

  // -------- UPDATE --------
  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("sizes", JSON.stringify(sizes));
    if (image) formData.append("image", image);

    try {
      const res = await fetch(`${API_URL}/api/product/edit/${id}`, {
        method: "PUT",
        body: formData,
        credentials: "include",
      });

      if (res.ok) {
        alert("تم التحديث بنجاح ✅");
        router.push("/dashboard");
      } else {
        alert("فشل التحديث");
      }
    } catch (err) {
      console.error(err);
      alert("حدث خطأ أثناء التحديث");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
     <header className="edit-header">
        <h1>✏️ تعديل المنتج</h1>
        <Link href="/home">
          <button className="btn btn-secondary">العودة إلى الصفحة الرئيسية</button>
        </Link>
      </header>
    
    <div className="edit-page">

      {/* ===== HEADER ===== */}
     

      {/* ===== CARD ===== */}
      <div className="edit-card">

        {/* ===== REVIEW SECTION ===== */}
        <div className="review-section">
          <h3>معاينة المنتج الحالي</h3>
          <div className="review-field">
            <span>الاسم:</span> {title}
          </div>
          <div className="review-field">
            <span>الوصف:</span> {description}
          </div>
          <div className="review-field">
            <span>الأحجام والأسعار:</span>
            <div className="review-sizes">
              {sizes.map((s, i) => (
                <div key={i} className="size-badge">
                  {s.width} × {s.height} - {s.price} د.ع
                </div>
              ))}
            </div>
          </div>
          {preview && (
            <div className="review-field" style={{ marginTop: "10px" }}>
              <img 
                src={preview} 
                alt="معاينة" 
                style={{ width: "120px", borderRadius: "8px", border: "1px solid #e2e8f0" }} 
              />
            </div>
          )}
        </div>

        {/* ===== EDIT FORM ===== */}
        <h2 className="edit-title">تعديل المنتج</h2>
        <form className="edit-form" onSubmit={handleUpdate}>
          
          <div>
            <label>اسم المنتج</label>
            <input 
              type="text" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              required 
            />
          </div>

          <div>
            <label>الوصف</label>
            <textarea 
              rows="4" 
              value={description} 
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div className="sizes-container">
            <label>الأحجام والأسعار</label>
            {sizes.map((size, index) => (
              <div className="size-row" key={index}>
                <input 
                  type="number" 
                  placeholder="العرض" 
                  value={size.width} 
                  step='any'
                  onChange={(e) => handleSizeChange(index, "width", e.target.value)} 
                  required 
                />
                <input 
                  type="number" 
                  placeholder="الارتفاع" 
                  step="any"
                  value={size.height} 
                  onChange={(e) => handleSizeChange(index, "height", e.target.value)} 
                  required 
                />
                <input 
                  type="number" 
                  placeholder="السعر" 
                  step="any"
                  value={size.price} 
                  onChange={(e) => handleSizeChange(index, "price", e.target.value)} 
                  required 
                />
                {sizes.length > 1 && (
                  <button type="button" className="btn btn-danger" onClick={() => removeSize(index)}>
                    حذف
                  </button>
                )}
              </div>
            ))}
            <button type="button" className="btn btn-success" onClick={addSize}>
              + إضافة حجم
            </button>
          </div>

          <div>
            <label>صورة المنتج</label>
            <input type="file" onChange={handleImageChange} accept="image/*" />
            {preview && (
              <div className="image-preview" style={{ marginTop: "10px", position: "relative" }}>
                <img src={preview} alt="معاينة" />
                <button 
                  type="button" 
                  onClick={removeImage} 
                  className="btn btn-danger"
                  style={{ position: "absolute", top: "5px", left: "5px" }}
                >
                  حذف الصورة
                </button>
              </div>
            )}
          </div>

          <div className="edit-buttons">
            <button type="submit" className="save-btn" disabled={loading}>
              {loading ? "جاري التحديث... ⏳" : "حفظ التغييرات"}
            </button>
          </div>

        </form>
      </div>
    </div>
    </>
  );
}
