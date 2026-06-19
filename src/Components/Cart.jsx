import React, { useEffect, useState } from 'react'
import Nav from './Nav/Nav'
import axios from 'axios';
import styles from './Admin/categories.module.css';

const Cart = () => {
  const backendURL = "http://127.0.0.1:8000";
  const [cart, setCart] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState(""); 
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showerror, setShowerror] = useState(false);
const[e,sete] = useState("");
  
  const fetshcart = async () => {
    const token = localStorage.getItem("token");
    try {
      setLoading(true);
      const response = await axios.get(`${backendURL}/api/show_cart`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCart(response.data.data);
      console.log(response.data.data);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
    finally{
      setLoading(false);
    }
  };

  useEffect(() => {
    fetshcart();
  }, []);

  const handleDelete = async (id) => {
    try {
      setLoading(true);
      await axios.delete(`${backendURL}/api/remove_from_cart/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      fetshcart();
    } catch (error) {
      sete(error.response?.data?.msg || 'Error deleting item from cart');
      setShowerror(true);
      setTimeout(() => setShowerror(false), 5000);
      console.error('Error deleting item from cart:', error);
    }
    finally{
      setLoading(false);
    }
  };

  const updatequantity = async (quantity, id) => {
    try {
      setLoading(true);
      await axios.patch(`${backendURL}/api/update_quantity/${quantity}/${id}`, {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      fetshcart();
    }
    catch(error){
      sete(error.response?.data?.msg || 'Error updating quantity');
      setShowerror(true);
      setTimeout(() => setShowerror(false), 4000);
      console.error("Error updating quantity:", error);
  }
  finally{
    setLoading(false);
  }
 
};

  const handleIncrement = (id , quantity) => {
    
    try {
  
      updatequantity(quantity + 1 , id);
      window.dispatchEvent(new Event('cartUpdated'));
      window.dispatchEvent(new Event('cartHighlight'));
    } catch (error) {
      sete(error.response?.data?.msg || 'Error incrementing quantity');
      setShowerror(true);
      setTimeout(() => setShowerror(false), 4000);
      console.error("Error incrementing quantity:", error);

    }
    
  };

  const handledecrement = (id , quantity) => {
 try {
     
      updatequantity(quantity - 1 , id);
      window.dispatchEvent(new Event('cartUpdated'));
      window.dispatchEvent(new Event('cartHighlight'));
    } catch (error) {
      sete(error.response?.data?.msg || 'Error decrementing quantity');
      setShowerror(true);
      setTimeout(() => setShowerror(false), 4000);
      console.error("Error decrementing quantity:", error);
    }
   
  };

  // Calculate subtotal
  const subtotal = cart.reduce(
    (sum, item) => sum + (item.product?.price || 0) * item.quantity,
    0
  );
  const shipping = cart.length > 0 ? 30 : 0;
  const total = subtotal + shipping;

 const addpayment = async () =>{
    try {
      setLoading(true);
      await axios.post(
        `${backendURL}/api/add_payment`,
        { payment_method: paymentMethod }, // <-- send as object
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }
      );
    
    } catch (error) {
      sete(error.response?.data?.msg || 'Error recording payment');
      setShowerror(true);
      setTimeout(() => setShowerror(false), 4000);
      console.error('Error recording payment:', error);
    }
    finally{
      setLoading(false);
    }
 }
  const handleCompletePayment = () => {
    if (!paymentMethod) {
      sete("Please select a payment method.");
       setShowerror(true);
      setTimeout(() => setShowerror(false), 4000);
      return;
    }
    if(e ===""){
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 4000);
    }
   addpayment();
   fetshcart();
  };

  return (
    <>
      <Nav />
        {loading && (
        <div className={styles.loaderOverlay}>
          <div className={styles.loader}></div>
        </div>
      )}
       {/* {showSuccess && <div className={styles.successMessage}> **Order Placed Successfully** 
        <br />
       --Payment Method : 
         
         
          {
         paymentMethod
        }
        <br />
        --Total: {total} EGP
        </div>} */}
        {showerror && <div className={styles.errorMessage}>**{e}**</div>}

      <table className={styles.categoriesTable}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Product Name</th>
            <th>Price</th>
            <th>Quantity</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {cart.map((item) => (
            <tr key={item.id}>
              <td>{item.id}</td>
              <td>{item.product.name}</td>
              <td>{item.product.price}</td>
              <td>{item.quantity}</td>
              <td>
                <button
                  className={styles.actionBtn}
                  onClick={() => handleIncrement(item.id , item.quantity)}
                >
                  +
                </button>
                <button
                  className={styles.actionBtn}
                  onClick={() => handledecrement(item.id , item.quantity)}
                >
                  -
                </button>
                <button
                  className={styles.actionBtn}
                  onClick={() => handleDelete(item.id)}
                >
                  Remove
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Receipt Section */}
      <div style={{
        maxWidth: 340,
        margin: "30px auto 0 auto",
        background: "#fff",
        borderRadius: 10,
        boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
        padding: "24px 28px",
        fontSize: "1.1rem"
      }}>
        <h3 style={{ marginBottom: 18, color: "#007bff" }}>Receipt</h3>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <span>Subtotal</span>
          <span>{subtotal} EGP</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <span>Shipping</span>
          <span>{shipping} EGP</span>
        </div>
        <hr style={{ margin: "12px 0" }} />
        <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold", fontSize: "1.15rem" }}>
          <span>Total</span>
          <span>{total} EGP</span>
        </div>
        {/* Payment Method Buttons */}
        <div style={{ marginTop: 18, display: "flex", gap: 12 }}>
          <button
            style={{
              flex: 1,
              background: paymentMethod === "on_delivery" ? "#007bff" : "#f5f5f5",
              color: paymentMethod === "on_delivery" ? "#fff" : "#222",
              border: "1px solid #007bff",
              borderRadius: 6,
              padding: "8px 0",
              fontWeight: 500,
              cursor: "pointer"
            }}
            onClick={() => setPaymentMethod("on_delivery")}
          >
            On Delivery
          </button>
          <button
            style={{
              flex: 1,
              background: paymentMethod === "credit_card" ? "#007bff" : "#f5f5f5",
              color: paymentMethod === "credit_card" ? "#fff" : "#222",
              border: "1px solid #007bff",
              borderRadius: 6,
              padding: "8px 0",
              fontWeight: 500,
              cursor: "pointer"
            }}
            onClick={() => setPaymentMethod("credit_card")}
          >
            Credit Card
          </button>
        </div>
        {/* Complete Payment Button */}
        <button
         style={{
  marginTop: 18,
  width: "100%",
  background: paymentMethod ? "#ff7f50" : "#ccc", // Remove extra {}
  color: "#fff",
  border: "none",
  borderRadius: 8,
  padding: "10px 0",
  fontSize: "1.1rem",
  fontWeight: 500,
  cursor: paymentMethod ? "pointer" : "not-allowed" // Remove extra {}
}}

          onClick={handleCompletePayment}
        >
          Complete Order
        </button>
      </div>
    </>
  )
}

export default Cart
