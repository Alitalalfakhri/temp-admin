'use client'

import { useEffect, useState } from "react";
import { API_URL } from "../lib.js";
import "../styles/dashboard.css";
import Link from 'next/link';
import axios from 'axios';
import { useRouter } from "next/navigation";

export default function Dashboard() {
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

  // ---------------- STATE ----------------
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [sizes, setSizes] = useState([{ width: "", height: "", price: "" }]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);

  // ---------------- IMAGE PREVIEW ----------------
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

  // Clean up object URL
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  // ---------------- SIZE LOGIC ----------------
  const addSize = () => setSizes([...sizes, { width: "", height: "", price: "" }]);
  const removeSize = (index) => setSizes(sizes.filter((_, i) => i !== index));
  const handleSizeChange = (index, field, value) => {
    const updated = [...sizes];
    updated[index][field] = value;
    setSizes(updated);
  };

  // ---------------- FETCH PRODUCTS ----------------
  const fetchProducts = async () => {
    setLoadingProducts(true);
    try {
      const response = await fetch(`${API_URL}/api/products`, { withCredentials: true });
      const data = await response.json();
      setProducts(data);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // ---------------- ADD PRODUCT ----------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!image) return alert("يجب اختيار صورة!");
    if (sizes.length === 0) return alert("يجب إضافة حجم واحد على الأقل!");

    const formData = new FormData();
    formData.append("image", image);
    formData.append("title", title);
    formData.append("description", description);
    formData.append("sizes", JSON.stringify(sizes));

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/add/product`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (response.ok) {
        alert("تمت إضافة المنتج بنجاح ✅");
        // Reset form
        setTitle("");
        setDescription("");
        setImage(null);
        setPreview(null);
        setSizes([{ width: "", height: "", price: "" }]);
        fetchProducts();
      } else {
        alert("فشل في حفظ المنتج");
      }
    } catch (err) {
      console.error(err);
      alert("خطأ في الاتصال بالخادم");
    } finally {
      setLoading(false);
    }
  };

  // ---------------- DELETE PRODUCT ----------------
  const deleteProduct = async (id) => {
    if (!window.confirm("هل أنت متأكد من الحذف؟")) return;

    try {
      const response = await axios.delete(`${API_URL}/api/product/${id}`, { withCredentials: true });
      if (response.status === 200) {
        fetchProducts();
      } else {
        alert("فشل الحذف");
      }
    } catch (err) {
      console.error(err);
      alert("خطأ في الحذف");
    }
  };

  // ---------------- JSX ----------------
  return (
    <div className="container">
      {/* ===== HEADER ===== */}
      <header className="header" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        padding: '10px 0',
        borderBottom: '1px solid #ccc'
      }}>
        <h1>🛍️ لوحة تحكم المنتجات</h1>
        <Link href="/home">
          <button className="btn btn-secondary">العودة إلى الصفحة الرئيسية</button>
        </Link>
      </header>

      {/* ===== ADD PRODUCT ===== */}
      <div className="card">
        <h2>إضافة منتج جديد</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>اسم المنتج *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>الوصف *</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          {/* IMAGE */}
          <div className="form-group">
            <label>صورة المنتج *</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              required={!image}
            />

            {preview ? (
              <div style={{ marginTop: "10px", position: "relative" }}>
                <img
                  src={preview}
                  alt="معاينة"
                  style={{
                    width: "100%",
                    maxHeight: "250px",
                    objectFit: "cover",
                    borderRadius: "8px",
                  }}
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="btn btn-danger"
                  style={{ position: "absolute", top: "10px", left: "10px" }}
                >
                  حذف الصورة
                </button>
              </div>
            ) : (
              <p style={{ opacity: 0.6 }}>لم يتم اختيار صورة بعد</p>
            )}
          </div>

          {/* SIZES */}
          <div className="form-group">
            <label>الأحجام والأسعار *</label>
            {sizes.map((size, index) => (
              <div key={index} className="size-item">
                <input
                  type="number"
                  placeholder="العرض"
                  step='any'
                  value={size.width}
                  onChange={(e) => handleSizeChange(index, "width", e.target.value)}
                  required
                />
                <input
                  type="number"
                  placeholder="الارتفاع"
                  step='any'
                  value={size.height}
                  onChange={(e) => handleSizeChange(index, "height", e.target.value)}
                  required
                />
                <input
                  type="number"
                  placeholder="السعر"
                  step='any'
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

          <button type="submit" className="btn btn-primary" disabled={loading || loadingProducts}>
            {loading ? "جاري الإرسال... ⏳" : "إضافة المنتج"}
          </button>
        </form>
      </div>

      {/* ===== PRODUCTS LIST ===== */}
      <div className="card">
        <h2>المنتجات الحالية</h2>

        {loadingProducts ? (
          <p style={{ opacity: 0.6 }}>جاري تحميل المنتجات... ⏳</p>
        ) : (
          <div className="products-grid">
            {products.map((product) => (
              <div key={product._id} className="card">
                <img
                  src={product.imageLink}
                  alt={product.title}
                  style={{ width: "100%", borderRadius: "5px" }}
                />
                <h3>{product.title}</h3>
                <p>{product.description}</p>

                {product.sizes && product.sizes.length > 0 && (
                  <div className="sizes-list" style={{ marginTop: "8px" }}>
                    <h4 style={{ fontSize: "14px", marginBottom: "4px" }}>الأحجام والأسعار:</h4>
                    <ul style={{ fontSize: "13px", paddingLeft: "16px" }}>
                      {product.sizes.map((size, i) => (
                        <li key={i}>
                          عرض: {size.width} × ارتفاع: {size.height} - السعر: {size.price} د.ع
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                  <Link href={`/dashboard/edit/?id=${product._id}`}>
                    <button className="edit-btn">تعديل</button>
                  </Link>

                  <button className="delete-btn" onClick={() => deleteProduct(product._id)}>
                    حذف
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
