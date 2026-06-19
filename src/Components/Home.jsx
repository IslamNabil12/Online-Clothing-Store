import React, { useEffect, useState } from "react";
import Nav from "./Nav/Nav";
import axios from "axios";
import styles from "./Home.module.css";

const backendURL = "http://127.0.0.1:8000";

const Home = () => {

  const [products, setProducts] = useState([]);
  const [currentImageIdx, setCurrentImageIdx] = useState({});
    const [loading, setLoading] = useState(false);
  

  useEffect(() => {
    const fetchProducts = async () => {
      const token = localStorage.getItem("token");
      try {
        setLoading(true);
        const response = await axios.get(`${backendURL}/api/show_products`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProducts(response.data.data);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
      finally{
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleImageSwap = (productId, idx) => {
    setCurrentImageIdx((prev) => ({
      ...prev,
      [productId]: idx,
    }));
  };

  return (
    <>
     {loading && (
            <div className={styles.loaderOverlay}>
              <div className={styles.loader}></div>
            </div>
          )}
      <Nav />
      <div className={styles.container}>

        <div className={styles.productsGrid}>
          {products.map((product) => {
            const images = Array.isArray(product.images)
              ? product.images
              : JSON.parse(product.images || "[]");
            const mainIdx = currentImageIdx[product.id] || 0;
            const mainImage = images.length > 0 ? `${backendURL}${images[mainIdx]}` : "";

            return (
              <div className={styles.productCard} key={product.id}>
                <div className={styles.images}>
                  {mainImage ? (
                    <img
                      src={mainImage}
                      alt={product.name}
                      className={styles.mainImage}
                    />
                  ) : (
                    <div className={styles.placeholder}>
                      <span>No Image</span>
                    </div>
                  )}

                  {images.length > 1 && (
                    <div className={styles.thumbnails}>
                      {images.map((img, idx) => (
                        <img
                          key={idx}
                          src={`${backendURL}${img}`}
                          alt={`thumb-${idx}`}
                          className={`${styles.thumbnail} ${mainIdx === idx ? styles.activeThumbnail : ""}`}
                          onClick={() => handleImageSwap(product.id, idx)}
                        />
                      ))}
                    </div>
                  )}
                </div>

                <h3>{product.name}</h3>
                <p>{product.description}</p>
                <p className={styles.price}>Price: ${product.price}</p>

                <button
                  className={styles.detailsBtn}
                  onClick={() => (window.location.href = `/Singleprod/${product.id}`)}
                >
                  Show Details
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default Home;
