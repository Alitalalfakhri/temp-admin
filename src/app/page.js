"use client";
import React, { useState } from 'react';
import styles from './styles/signin.module.css'; // Ensure this path matches your file location
import axios from 'axios';
import {API_URL} from './lib.js'









export default function SignInPage() {
  const [loading , setLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    idNumber: ''
  });

  const handleSubmit = (e) => {
  e.preventDefault();
  setLoading(true)
  

  axios.post(`${API_URL}/api/sign`, formData, { withCredentials: true })
    .then(res => {
      if (res.status === 200) {
        window.location.href = '/home';
        setLoading(false)
      }
    })
    .catch((err) =>{ 
      
          setLoading(false)
      console.error(err.response?.data || err.message)}
  
    );
};

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2 className={styles.title}>تسجيل الدخول</h2>
        
        <form onSubmit={handleSubmit}>
          {/* اسم المستخدم */}
          <div className={styles.formGroup}>
            <label className={styles.label}>اسم المستخدم</label>
            <input
              type="text"
              className={styles.input}
              placeholder="أدخل اسم المستخدم"
              required
              onChange={(e) => setFormData({...formData, username: e.target.value})}
            />
          </div>

          {/* رقم الهوية */}
          <div className={styles.formGroup}>
            <label className={styles.label}>رقم الهوية</label>
            <input
              type="text"
              className={styles.input}
              placeholder="أدخل رقم الهوية"
              required
              onChange={(e) => setFormData({...formData, idNumber: e.target.value})}
            />
          </div>

          {/* كلمة المرور */}
          <div className={styles.formGroup}>
            <label className={styles.label}>كلمة المرور</label>
            <input
              type="password"
              className={styles.input}
              placeholder="أدخل كلمة المرور"
              required
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? "جاري تسجيل الدخول... ⏳" : "تسجيل الدخول" }
          </button>
        </form>

      
      </div>
    </div>
  );
}