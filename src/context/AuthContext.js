// src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios'; // Axios'u import ettik

// AuthContext oluştur
const AuthContext = createContext(null);

// AuthContext'i kullanmak için özel bir hook
export const useAuth = () => {
  return useContext(AuthContext);
};

// AuthProvider bileşeni, tüm uygulamayı sarar
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Kullanıcı bilgileri (username, email, favorites)
  const [token, setToken] = useState(null); // JWT token
  const [loading, setLoading] = useState(true); // Yükleme durumu

  // Backend API URL'i
  // server.js'teki PORT ile eşleşmeli.
  const API_URL = "http://localhost:5001/api";

  useEffect(() => {
    // Uygulama yüklendiğinde localStorage'dan token ve kullanıcı bilgilerini kontrol et
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(parsedUser);
        console.log("🟢 AuthContext: localStorage'dan kullanıcı ve token yüklendi.", parsedUser);
      } catch (e) {
        // JSON parse hatası veya bozuk veri varsa temizle
        console.error("🔴 AuthContext: localStorage'dan kullanıcı bilgisi ayrıştırılırken hata oluştu. Temizleniyor.", e);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setToken(null);
      }
    }
    setLoading(false); // Yükleme tamamlandı
  }, []);

  // Kullanıcı ve token her değiştiğinde localStorage'ı güncelle
  // Bu useEffect, login, logout, addFavorite, removeFavorite gibi işlemlerde kullanıcı nesnesi güncellendiğinde tetiklenecek
  useEffect(() => {
    if (user && token) {
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', token);
      console.log("🟢 AuthContext: Kullanıcı veya token güncellendi, localStorage'a kaydedildi.", user.username);
    } else if (!user && !token && !loading) { // Kullanıcı çıkış yaptığında veya oturum yoksa temizle
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      console.log("🟡 AuthContext: Kullanıcı veya token boş, localStorage temizlendi.");
    }
  }, [user, token, loading]); // user, token veya loading değiştiğinde çalışır


  // Giriş (login) fonksiyonu
  const login = (newToken, newUser) => {
    setToken(newToken);
    setUser(newUser);
    console.log("🟢 AuthContext: Kullanıcı giriş yaptı.", newUser.username);
    // localStorage.setItem işlemleri yukarıdaki useEffect tarafından yönetilecek
  };

  // Çıkış (logout) fonksiyonu
  const logout = () => {
    setToken(null);
    setUser(null);
    console.log("🟡 AuthContext: Kullanıcı çıkış yaptı.");
    // localStorage.removeItem işlemleri yukarıdaki useEffect tarafından yönetilecek
  };

  // Favori Pokémon ekleme fonksiyonu
  const addFavorite = async (pokemonData) => {
    // pokemonData: { pokemonId: number, pokemonName: string }
    if (!token || !user) {
      console.warn("🟡 AuthContext: Favori eklenemedi, token veya kullanıcı yok.");
      throw new Error("Giriş yapmadan favori ekleyemezsiniz.");
    }

    try {
      console.log("🟠 AuthContext: Favori ekleme isteği gönderiliyor:", pokemonData.pokemonName, "(ID:", pokemonData.pokemonId, ")");
      const res = await axios.post(`${API_URL}/users/favorites/add`, pokemonData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      console.log("🟢 AuthContext: Favori ekleme başarılı:", res.data.message);

      // Backend, güncel kullanıcı objesini (favorileri dahil) döndürdüğü için doğrudan set ediyoruz.
      if (res.data && res.data.user) {
        setUser(res.data.user);
        console.log("🟢 AuthContext: User state'i güncel favorilerle set edildi.");
      } else {
        // Bu blok, server.js doğru çalıştığı sürece tetiklenmemelidir.
        // Ancak yine de olası bir duruma karşı manuel güncelleme mantığını koruyabiliriz.
        console.warn("🟡 AuthContext: Backend'den tam user objesi gelmedi, favoriler manuel güncelleniyor.");
        setUser(prevUser => ({
          ...prevUser,
          favorites: prevUser.favorites ? [...prevUser.favorites, pokemonData] : [pokemonData],
        }));
      }
      return res.data;
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message;
      console.error("🔴 AuthContext: Favori eklenirken hata oluştu:", errorMessage);
      throw new Error(errorMessage); // Hatayı daha anlamlı bir mesajla ilet
    }
  };

  // Favori Pokémon silme fonksiyonu
  const removeFavorite = async (pokemonId) => {
    if (!token || !user) {
      console.warn("🟡 AuthContext: Favori silinemedi, token veya kullanıcı yok.");
      throw new Error("Giriş yapmadan favori silemezsiniz.");
    }

    try {
      console.log("🟠 AuthContext: Favori silme isteği gönderiliyor (ID):", pokemonId);
      const res = await axios.post(`${API_URL}/users/favorites/remove`, { pokemonId }, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      console.log("🟢 AuthContext: Favori silme başarılı:", res.data.message);

      // Backend, güncel kullanıcı objesini (favorileri dahil) döndürdüğü için doğrudan set ediyoruz.
      if (res.data && res.data.user) {
        setUser(res.data.user);
        console.log("🟢 AuthContext: User state'i güncel favorilerle set edildi.");
      } else {
        // Bu blok, server.js doğru çalıştığı sürece tetiklenmemelidir.
        // Ancak yine de olası bir duruma karşı manuel güncelleme mantığını koruyabiliriz.
        console.warn("🟡 AuthContext: Backend'den tam user objesi gelmedi, favoriler manuel güncelleniyor.");
        setUser(prevUser => ({
          ...prevUser,
          favorites: prevUser.favorites?.filter(fav => fav.pokemonId !== pokemonId) || [],
        }));
      }
      return res.data;
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message;
      console.error("🔴 AuthContext: Favori silinirken hata oluştu:", errorMessage);
      throw new Error(errorMessage); // Hatayı daha anlamlı bir mesajla ilet
    }
  };

  const value = {
    user,
    setUser,
    token,
    loading,
    login,
    logout,
    addFavorite,    // Yeni favori fonksiyonu
    removeFavorite, // Yeni favori fonksiyonu
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children} {/* Yükleme tamamlandığında çocukları render et */}
    </AuthContext.Provider>
  );
};
