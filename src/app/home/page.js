'use client'

import { useEffect, useState } from "react";
import {API_URL} from '../lib.js'
import "../styles/home.css";
import {useRouter} from 'next/navigation'
import axios from 'axios'
export default function Home() {
    const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/auth/check`, {
          withCredentials: true, // send cookie automatically
        });

        if (!res.data.authenticated) {
          router.push('/'); // redirect if not authenticated
        }
      } catch (err) {
        console.log('Not authenticated', err);
        router.push('/'); // redirect if error occurs
      }
    };

    checkAuth();
  }, [router]);
  const [products, setProducts] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ---------------- FETCH PRODUCTS ----------------
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/products`);

      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }

      const data = await response.json();
      setProducts(data);
    } catch (err) {
      console.error(err);
      setError("حدث خطأ أثناء تحميل المنتجات");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <>
      {/* ---------------- Navigation ---------------- */}
      <nav>
        <div className="nav-container">
          <a href="/" className="logo">
            🛍️  الطيف الذهبي
          </a>

          <button
            className="menu-toggle"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            ☰
          </button>

          <ul className={`nav-links ${menuOpen ? "active" : ""}`}>
          
            <li>
              <a href="/dashboard" className="admin-btn">
                لوحة تحكم المنتجات
              </a>
              
            </li>
            <li>
              <a href="/media" className="admin-btn">
                لوحة تحكم الميديا

              </a>
            </li>
          </ul>
        </div>
      </nav>

      {/* ---------------- Hero Section ---------------- */}
      <section className="hero">
        <h1>نظام إدارة المنتجات</h1>
        <p>إدارة منتجاتك بكفاءة</p>
      </section>

      {/* ---------------- Products Section ---------------- */}
      <section className="products-section">
        <h2 className="section-title">معاينة المنتجات</h2>

        {loading && <p style={{ textAlign: "center" }}>جاري التحميل... ⏳</p>}

        {error && (
          <p style={{ textAlign: "center", color: "red" }}>
            {error}
          </p>
        )}

        {!loading && !error && (
          <div className="products-grid">
            {products.length === 0 ? (
              <p style={{ textAlign: "center" }}>
                لا توجد منتجات حالياً
              </p>
            ) : (
              products.map((product) => (
                <div key={product._id} className="card">
                  <img
                    src={product.imageLink}
                    alt={product.title}
                    style={{
                      width: "100%",
                      borderRadius: "8px",
                      objectFit: "cover",
                    }}
                  />
                  <h3>{product.title}</h3>
                  <p>{product.description}</p>
                    {/*sizes  */}

                    {product.sizes && product.sizes.length > 0 && (
          <div className="sizes-list">
            <h4>الأحجام والأسعار:</h4>
            <ul>
              {product.sizes.map((size, i) => (
                <li key={i}>
                  عرض: {size.width} × ارتفاع: {size.height} - السعر: {size.price} د.ع
                </li>
              ))}
            </ul>
          </div>
        )}
                </div>
              ))
            )}
          </div>
        )}
      </section>

      {/* ---------------- Footer ---------------- */}
      <footer>
        <p>
          &copy; {new Date().getFullYear()} نظام إدارة المنتجات.
          لوحة تحكم الإدارة.
        </p>
      </footer>
    </>
  );
}
