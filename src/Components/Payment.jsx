import React, { useEffect, useState } from 'react';
import Nav from './Nav/Nav';
import axios from 'axios';
import styles from './Admin/payment.module.css';

const Payment = () => {
  const [user, setUser] = useState({});
  const [pay, setPayment] = useState([]);
  const [specificProduct, setSpecificProduct] = useState(null);
  const [productDetails, setProductDetails] = useState({});
  const [loading, setLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(null); // <-- Track cancel per order
   const [showerror, setShowerror] = useState(false);
  const[e,sete] = useState("");
  const role = async () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        setLoading(true);
        const res = await axios.get("http://localhost:8000/api/user", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
  };

  const payment = async (userId) => {
    const token = localStorage.getItem("token");
    if (!userId) return;
    try {
      setLoading(true);
      const response = await axios.get(
        `http://localhost:8000/api/show_payment_by_user/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPayment(response.data.data || []);
    } catch (error) {
      console.error("Error fetching payments:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSpecificProduct = async (productId) => {
    const token = localStorage.getItem("token");
    if (!productId) return;
    try {
      setLoading(true);
      const response = await axios.get(
        `http://localhost:8000/api/show_specific_product/${productId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSpecificProduct(response.data.data);
    } catch (error) {
      console.error("Error fetching product:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProductInline = async (productId) => {
    if (productDetails[productId]) return;
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get(
        `http://localhost:8000/api/show_specific_product/${productId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProductDetails((prev) => ({
        ...prev,
        [productId]: response.data.data,
      }));
    } catch (error) {
      console.error("Error fetching inline product:", error);
    }
  };

  const cancelorder = async (productId) => {
    const token = localStorage.getItem("token");
    setCancelLoading(productId);
    try {
      await axios.patch(
        `http://localhost:8000/api/cancel_payment/${productId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      payment(user.id);
    } catch (error) {
      sete(error.response?.data?.msg || 'Error cancelling order');
      setShowerror(true);
      setTimeout(() => setShowerror(false), 5000);
      console.error("Error cancelling order:", error);
    } finally {
      setCancelLoading(null);
    }
  };
 const refundorder = async (productId) => {
    const token = localStorage.getItem("token");
    setCancelLoading(productId);
    try {
      await axios.patch(
        `http://localhost:8000/api/refund_payment/${productId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      payment(user.id);
    } catch (error) {
      
      sete(error.response?.data?.msg || 'Error cancelling order');
      setShowerror(true);
      setTimeout(() => setShowerror(false), 5000);
      console.error("Error cancelling order:", error);
    } finally {
      setCancelLoading(null);
    }
  };
  useEffect(() => {
    role();
  }, []);

  useEffect(() => {
    if (user && user.id) {
      payment(user.id);
    }
  }, [user]);

  useEffect(() => {
    pay.forEach((paymentItem) => {
      paymentItem.products?.forEach((prod) => {
        fetchProductInline(prod.product_id);
      });
    });
  }, [pay]);

  const getStatusColor = (status) => {
    switch ((status || '').toLowerCase()) {
      case 'pending':
        return '#ff9800';
      case 'completed':
        return '#4caf50';
      case 'canceled':
        return '#f44336';
      case 'refund':
        return '#2196f3';
      default:
        return '#888';
    }
  };

  return (
    <>
      <Nav />
{showerror && (
        <div className={styles.errorMessage}>
          {e}
        </div>
      )}
      {loading && (
        <div className={styles.loaderOverlay}>
          <div className={styles.loader}></div>
        </div>
      )}

    
      <div className={styles.tableWrapper}>
      <table className={styles.categoriesTable}>
        <thead>
          <tr>
            <th>Payment ID</th>
            <th>Products</th>
            <th>Total Price</th>
            <th>Payment Method</th>
            <th>Status</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {pay.map((paymentItem) => (
            <tr key={paymentItem.id}>
              <td>{paymentItem.id}</td>
              <td>
                {paymentItem.products?.length ? (
                  <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
                    {paymentItem.products.map((prod, idx) => {
                      const details = productDetails[prod.product_id];
                      return (
                        <li key={idx} style={{ marginBottom: 6 }}>
                          <b>Name:</b> {details ? details.name : "Loading..."} |
                          <b> Quantity:</b> {prod.quantity} | <b>Price:</b> {prod.price}
                          <button
                            style={{
                              marginLeft: 8,
                              padding: "2px 8px",
                              borderRadius: 4,
                              border: "1px solid #28a745",
                              background: "#f5fff7",
                              color: "#28a745",
                              cursor: "pointer",
                            }}
                            onClick={() => fetchSpecificProduct(prod.product_id)}
                          >
                            Show Details
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <span>No products</span>
                )}
              </td>
              <td>{paymentItem.total_price} EGP</td>
              <td>{paymentItem.payment_method}</td>
              <td>
                <span
                  style={{
                    color: '#fff',
                    background: getStatusColor(paymentItem.status),
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontWeight: 600,
                    fontSize: '0.98em',
                    display: 'inline-block',
                    minWidth: 80,
                    textAlign: 'center',
                    textTransform: 'capitalize'
                  }}>
                  {paymentItem.status}
                </span>
              </td>
              <td>{paymentItem.payment_date || "N/A"}</td>
              <td>
                {paymentItem.status?.toLowerCase() === 'pending' && (
                  <button
                    style={{
                      padding: "6px 12px",
                      borderRadius: 6,
                      border: "none",
                      background: "#f44336",
                      color: "#fff",
                      cursor: "pointer",
                      fontSize: "0.95em",
                      opacity: cancelLoading === paymentItem.id ? 0.6 : 1,
                    }}
                    disabled={cancelLoading === paymentItem.id}
                    onClick={() => cancelorder(paymentItem.id)}
                  >
                    {cancelLoading === paymentItem.id ? "Cancelling..." : "Cancel Order"}
                  </button>
                )}

                {paymentItem.status?.toLowerCase() === 'completed' && (
                  <button
                    style={{
                      padding: "6px 12px",
                      borderRadius: 6,
                      border: "none",
                      background: "#2196f3",
                      color: "#fff",
                      cursor: "pointer",
                      fontSize: "0.95em",
                      opacity: cancelLoading === paymentItem.id ? 0.6 : 1,
                    }}
                    disabled={cancelLoading === paymentItem.id}
                    onClick={() => refundorder(paymentItem.id)}
                  >
                    {cancelLoading === paymentItem.id ? "Refunding..." : "Refund Order"}
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
      {specificProduct && (
        <div className={styles.detailsCard}
        >
          <h3 style={{ color: "#007bff" }}>Product Details</h3>
          <div>
            <b>Product Name:</b> {specificProduct.name}
          </div>
          <div>
            <b>Description:</b> {specificProduct.description}
          </div>
          <div>
            <b>Price:</b> {specificProduct.price} EGP
          </div>
          <div>
            <b>Color:</b> {specificProduct.color}
          </div>
          <div>
            <b>Size:</b> {specificProduct.size}
          </div>

          <button
            style={{
              marginTop: 16,
              background: "#ff7f50",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "8px 18px",
              fontWeight: 500,
              cursor: "pointer",
            }}
            onClick={() => setSpecificProduct(null)}
          >
            Close
          </button>
        </div>
      )}
    </>
  );
};

export default Payment;
