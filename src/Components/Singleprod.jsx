import 'antd/dist/reset.css';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import style from './singleprod.module.css';
import Nav from './Nav/Nav';

const Singleprod = () => {
  const backendURL = "http://127.0.0.1:8000";
  const [quantity, setQuantity] = useState(1);
  const { id } = useParams();
  const [productDetails, setProductDetails] = useState({});
  const [currentImageIdx, setCurrentImageIdx] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);
    const [showerror, setShowerror] = useState(false);
  const[e,sete] = useState("");
const [user, setUser] = useState({});
    useEffect(() => {
    const role = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        axios
          .get("http://localhost:8000/api/user", {
            headers: { Authorization: `Bearer ${token}` },
          })
          .then((res) => setUser(res.data))
          .catch(() => setUser(null));
      }
      else{
        setUser(null);
      }
    }
    role();
  }, []);
  useEffect(() => {
    const getProductDetails = async () => {
      try {
        const response = await axios.get(`${backendURL}/api/show_specific_product/${id}`);
        setProductDetails(response.data.data);
      } catch (error) {
          sete(error.response?.data?.message || 'Error fetching product details');
          setShowerror(true);
          setTimeout(() => setShowerror(false), 5000);
        console.error('Error fetching product details:', error);
      }
    };
    getProductDetails();
  }, [id]);

  const handleAddToCart = async () => {
    if (user === null) {
 window.location.href = "/login";
    
    }
    const payload = {
      product_id: id,
      quantity: quantity
    };

    try {
      await axios.post(
        `${backendURL}/api/add_to_cart`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }
      );
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 1000);

      // After successful add to cart:
      window.dispatchEvent(new Event('cartUpdated'));
      window.dispatchEvent(new Event('cartHighlight'));

    } catch (error) {
      sete(error.response?.data?.msg || 'Error adding product to cart');
      setShowerror(true);
      setTimeout(() => setShowerror(false), 5000);
      console.error('Error adding product to cart:', error);
    }
  };

  const handleImageSwap = (productId, idx) => {
    setCurrentImageIdx((prev) => ({
      ...prev,
      [productId]: idx,
    }));
  };

  const mainImageIdx = currentImageIdx[productDetails.id] || 0;

  return (
    <>
    <Nav/>
    <div className={style.container}>
      {showSuccess && <div className={style.successMessage}>**Product added to cart successfully!**</div>}
{showerror && <div className={style.errorMessage}>**{e}**</div>}
      <div className={style.productCard}>
        <h2 className={style.productTitle}>{productDetails.name}</h2>

        {productDetails.images && productDetails.images.length > 0 && (
          <img
            src={`${backendURL}${productDetails.images[mainImageIdx]}`}
            alt={productDetails.name}
            className={style.mainImage}
          />
        )}

        {productDetails.images && productDetails.images.length > 1 && (
          <div className={style.imageGallery}>
            {productDetails.images.map((image, index) => (
              <img
                key={index}
                src={`${backendURL}${image}`}
                alt={`Product Image ${index + 1}`}
                className={`${style.thumbnail} ${mainImageIdx === index ? style.activeThumbnail : ''}`}
                onClick={() => handleImageSwap(productDetails.id, index)}
              />
            ))}
          </div>
        )}

        <p className={style.productDesc}><strong>Description:</strong> {productDetails.description}</p>
        <p className={style.productPrice}><strong>Price:</strong> {productDetails.price} EGP</p>
        <p className={style.category}><strong>Color:</strong> {productDetails.color}</p>
        <p className={style.category}><strong>Size:</strong> {productDetails.size}</p>

        <div className={style.quantityControl}>
          <button onClick={() => setQuantity(q => Math.max(1, q - 1))}>-</button>
          <span>Quantity: {quantity}</span>
          <button onClick={() => setQuantity(q => q + 1)}>+</button>
        </div>

        <button onClick={handleAddToCart} className={style.addToCart} >
          Add to Cart
        </button>
      </div>
    </div>
    </>
  );
};

export default Singleprod;
