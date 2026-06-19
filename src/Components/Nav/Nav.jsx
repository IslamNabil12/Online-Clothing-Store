import React, { useEffect, useState } from 'react';
import styles from './Nav.module.css';
import axios from 'axios';
import { FaShoppingCart } from 'react-icons/fa';

const Nav = () => {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState({});
  const [cartCount, setCartCount] = useState(0);
  const [cartActive, setCartActive] = useState(false);

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
    }
    role();
  }, []);
const [s, setS] = useState(false);
  useEffect(() => {
    const fetchCartCount = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          setS(true);
          const res = await axios.get("http://localhost:8000/api/cart_count", {
            headers: { Authorization: `Bearer ${token}` },
          });
          setCartCount(res.data.count || 0);
        } catch {
          setCartCount(0);
        }
      }
    };

    fetchCartCount();
    window.addEventListener('cartUpdated', fetchCartCount);

    return () => {
      window.removeEventListener('cartUpdated', fetchCartCount);
    };
  }, []);

  useEffect(() => {
    const handleCartHighlight = () => {
      setCartActive(true);
      setTimeout(() => setCartActive(false), 700);
    };
    window.addEventListener('cartHighlight', handleCartHighlight);
    return () => window.removeEventListener('cartHighlight', handleCartHighlight);
  }, []);

  return (
    <nav className={styles.navbar}>
      <div className={styles.logo} id="logo">Outi</div>
      <ul className={`${styles.navLinks} ${open ? styles.show : ''}`}>
        {
          user?.role_id === 1 ? (<>
            <li><a href="/">Home</a></li>
            <li><a href="/Users">Users</a></li>
            <li><a href="/product">Product</a></li>
            <li><a href="/Categories">Category</a></li>
            <li><a href="/PaymentA">Payment</a></li>
          </>) :
            <>
              <li><a href="/">Home</a></li>
              <li><a href="/payment">Orders</a></li>
              <li><a href="/about">Profile</a></li>
              <li><a href="/contact">Contact Us</a></li>
            </>
        }
      </ul>

      {/* Cart Icon with Interactive Count */}
      <div className={styles.cartWrapper}>
        <a href="/cart" className={styles.cartLink}>
          <FaShoppingCart onClick={()=> window.location.href='/Cart' }
            className={`${styles.cartIcon} ${cartActive ? styles.cartActive : ''}`}
          />
          {cartCount > 0 && (
            <span className={styles.cartCount}>{cartCount}</span>
          )}
        </a>
      </div>

      <div className={`${styles.cta} ${open ? styles.show : ''}`}>
        {
          s ? (
      
          <a href="/" className={styles.btn}  onClick={() => localStorage.removeItem("token")} style={{ color: 'red' , cursor: 'pointer' , fontWeight: 'bold', fontSize: '15px' }}> Log Out</a>
          ) : (<>
                <a href="/login" className={styles.btn}>Login</a>

        <a href="/register" className={`${styles.btn} ${styles.primary}`}>Register</a>
        </>
        )
          
        }
      </div>
      <div className={styles.menuToggle} id="menu-toggle" onClick={() => setOpen(!open)}>
        &#9776;
      </div>
    </nav>
  );
};

export default Nav;
