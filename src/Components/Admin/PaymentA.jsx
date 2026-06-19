import axios from 'axios';
import React, { useEffect, useState } from 'react';
import styles from './payment.module.css';
import Nav from '../Nav/Nav';

const PaymentA = () => {
  const [loading, setLoading] = useState(false);
  const [pay, setPayments] = useState([]);
  const [productDetails, setProductDetails] = useState({});
  const [specificProduct, setSpecificProduct] = useState(null);
  const [userDetails, setUserDetails] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [suserDetails, ssetUserDetails] = useState(null);
  const [id, setId] = useState(0);
  const backendBase = 'http://127.0.0.1:8000/api';

  const getHeaders = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  });

  // Populate users & products caches for a given payments array
  const populateUsersAndProducts = (paymentsArray) => {
    if (!Array.isArray(paymentsArray)) return;
    paymentsArray.forEach((paymentItem) => {
      if (paymentItem?.user_id) getuserById(paymentItem.user_id);
      paymentItem.products?.forEach((prod) => {
        if (prod?.product_id) fetchProductInline(prod.product_id);
      });
    });
  };
  const showPaymentsByUserName = async (name) => {
  const token = localStorage.getItem("token");
  try {
    setLoading(true);
    const res = await axios.get(
      `http://localhost:8000/api/showPaymentsByUserName/${name}`,
       getHeaders()
    );
    setPayments(res.data.data || []);

    console.log("Payments by username response:", res.data.data);
// handleResponseAndPopulate(res);
  } catch (error) {
    console.error("Error fetching payments:", error);
    setPayments([]);
  } finally {
    setLoading(false);
  }
};


  // Fetch all payments
  const getPayments = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${backendBase}/show_payments`, getHeaders());
      const data = res?.data?.data ?? res?.data ?? [];
      setPayments(Array.isArray(data) ? data : []);
      populateUsersAndProducts(data);
    } catch (err) {
      console.error('Error fetching payments:', err);
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch user by id (caches result)
  const getuserById = async (userId) => {
    if (!userId) return;
    if (userDetails[userId]) return; // already cached
    try {
      const res = await axios.get(`${backendBase}/show_specific_user/${userId}`, getHeaders());
      const user = res?.data?.data ?? res?.data ?? null;
      if (user) {
        setUserDetails((prev) => ({ ...prev, [userId]: user }));
      }
    } catch (err) {
      console.error('Error fetching user:', err);
    }
  };

  // Fetch product details (caches)
  const fetchProductInline = async (productId) => {
    if (!productId) return;
    if (productDetails[productId]) return;
    try {
      const res = await axios.get(`${backendBase}/show_specific_product/${productId}`, getHeaders());
      const product = res?.data?.data ?? res?.data ?? null;
      if (product) {
        setProductDetails((prev) => ({ ...prev, [productId]: product }));
      }
    } catch (err) {
      console.error('Error fetching product:', err);
    }
  };

  // Fetch single product for the details panel
  const fetchSpecificProduct = async (productId) => {
    if (!productId) return;
    setLoading(true);
    try {
      const res = await axios.get(`${backendBase}/show_specific_product/${productId}`, getHeaders());
      const product = res?.data?.data ?? res?.data ?? null;
      setSpecificProduct(product);
    } catch (err) {
      console.error('Error fetching specific product:', err);
    } finally {
      setLoading(false);
    }
  };

  // Complete / Delete actions (reuse getHeaders)
  const completeorder = async (paymentId) => {
    try {
      await axios.patch(`${backendBase}/complete_payment/${paymentId}`, {}, getHeaders());
      getPayments();
    } catch (err) {
      alert(err?.response?.data?.msg || 'Error completing order');
      console.error(err);
    }
  };

  const deletepayment = async (paymentId) => {
    try {
      await axios.patch(`${backendBase}/delete_payment/${paymentId}`, {}, getHeaders());
      getPayments();
    } catch (err) {
      alert(err?.response?.data?.msg || 'Error deleting order');
      console.error(err);
    }
  };

  // Helper to normalize response and populate caches (used for filters)
  const handleResponseAndPopulate = (res) => {
    const data = res?.data?.data ?? res?.data ?? [];
    setPayments(Array.isArray(data) ? data : []);
    populateUsersAndProducts(data);
  };

  // --- Filter endpoints (use same pattern) ---
  const getPaymentsByProduct = async (id) => {
    try {
      const res = await axios.get(`${backendBase}/show_payment_by_product/${id}`, getHeaders());
      handleResponseAndPopulate(res);
    } catch (err) {
      console.error('Error fetching by product:', err);
    }
  };

  const getPaymentsByStatus = async (status) => {
    try {
      const res = await axios.get(`${backendBase}/show_payment_by_status/${status}`, getHeaders());
      handleResponseAndPopulate(res);
    } catch (err) {
      console.error('Error fetching by status:', err);
    }
  };

  const getPaymentsByDate = async (date) => {
    try {
      const res = await axios.get(`http://127.0.0.1:8000/api/show_payment_by_date/${date}`, getHeaders());
      // handleResponseAndPopulate(res);
      console.log("Payments by date response:", res.data.data);
      setPayments(res.data.data || []);
    } catch (err) {
      setPayments([]);
      console.error('Error fetching by date:', err);
    }
  };

  const getPaymentsByMethod = async (method) => {
    try {
      const res = await axios.get(`${backendBase}/show_payment_by_method/${method}`, getHeaders());
      handleResponseAndPopulate(res);
    } catch (err) {
      console.error('Error fetching by method:', err);
    }
  };

  const getPaymentsByTotalPriceRange = async (userId) => {
    try {
      const res = await axios.get(`${backendBase}/showPaymentsByTotalPriceRange/${userId}`, getHeaders());
      handleResponseAndPopulate(res);
    } catch (err) {
      console.error('Error fetching by price range:', err);
    }
  };

  // status color helper (unchanged)
  const getStatusColor = (status) => {
    switch ((status || '').toLowerCase()) {
      case 'pending': return '#ff9800';
      case 'completed': return '#4caf50';
      case 'canceled': return '#f44336';
      case 'refund': return '#2196f3';
      default: return '#888';
    }
  };

  // on-payments change populate caches (keeps compatibility if setPayments is used elsewhere)
  useEffect(() => {
    populateUsersAndProducts(pay);
  }, [pay]);

  // initial load
  useEffect(() => {
    getPayments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Nav />

      {loading && (
        <div className={styles.loaderOverlay}>
          <div className={styles.loader}></div>
        </div>
      )}

      <div className={styles.tableWrapper}>
        <div className={styles.filterControls}>
          <button onClick={() => getPaymentsByProduct(searchTerm)}>By Product ID</button>
          <button onClick={() => showPaymentsByUserName(searchTerm)}>By User Name</button>
          <button onClick={() => getPaymentsByStatus(searchTerm)}>By Status</button>
          <button onClick={() => getPaymentsByDate(searchTerm)}>By Date</button>
          <button onClick={() => getPaymentsByMethod(searchTerm)}>By Method</button>
          <button onClick={() => getPaymentsByTotalPriceRange(searchTerm)}>By Price Range</button>
          <button className={styles.resetBtn} onClick={getPayments}>Reset</button>
        <form action="">
          <input type="text"  onChange={(e) => setSearchTerm(e.target.value)}/>
        </form>
        </div>

<div className={styles.tableWrapper}>
        <table className={styles.categoriesTable}>
          <thead>
            <tr>
              <th>Payment ID</th>
              <th>User Name</th>
              <th>Products</th>
              <th>Total Price</th>
              <th>Payment Method</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(pay) && pay.length ? pay.map((paymentItem) => (
              <tr key={paymentItem.id}>
                <td data-label="Payment ID">{paymentItem.id}</td>

                <td data-label="User Name">
                  {userDetails[paymentItem.user_id]
                    ? (
                      <>
                        {userDetails[paymentItem.user_id].name}
                        <button
                          className={styles.detailsBtn}
                          onClick={() => ssetUserDetails(userDetails[paymentItem.user_id])}
                          type="button"
                        >
                          Show Details
                        </button>
                      </>
                    )
                    : 'Loading...'
                  }
                </td>

                <td data-label="Products">
                  {paymentItem.products?.length ? (
                    <ul className={styles.productList}>
                      {paymentItem.products.map((prod, idx) => {
                        const details = productDetails[prod.product_id];
                        return (
                          <li key={idx} className={styles.productItem}>
                            <span><b>Name:</b> {details ? details.name : 'Loading...'}</span>
                            <span><b>Quantity:</b> {prod.quantity}</span>
                            <span><b>Price:</b> {prod.price}</span>
                            <button
                              className={styles.detailsBtn}
                              onClick={() => fetchSpecificProduct(prod.product_id)}
                              type="button"
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

                <td data-label="Total Price">{paymentItem.total_price} EGP</td>
                <td data-label="Payment Method">{paymentItem.payment_method}</td>
                <td data-label="Status">
                  <span
                    className={styles.statusBadge}
                    style={{ background: getStatusColor(paymentItem.status) }}
                  >
                    {paymentItem.status}
                  </span>
                </td>
                <td data-label="Date">{paymentItem.payment_date || 'N/A'}</td>

                <td data-label="Actions">
                  {paymentItem.status?.toLowerCase() === 'pending' && (
                    <button
                      className={`${styles.actionBtn} ${styles.completeBtn}`}
                      onClick={() => completeorder(paymentItem.id)}
                      type="button"
                    >
                      Complete Order
                    </button>
                  )}
                  <br />
                  <br />
                  <button
                    className={`${styles.actionBtn} ${styles.deleteBtn}`}
                    onClick={() => deletepayment(paymentItem.id)}
                    type="button"
                  >
                    Delete Order
                  </button>
                </td>
              </tr>
            )) : (
              <tr><td colSpan="8" style={{ textAlign: 'center' }}>No payments found</td></tr>
            )}
          </tbody>
        </table>
        </div>
      </div>

      {specificProduct && (
        <div className={styles.detailsCard}>
          <h3>Product Details</h3>
          <div><b>ID:</b> {specificProduct.id}</div>
          <div><b>Name:</b> {specificProduct.name}</div>
          <div><b>Description:</b> {specificProduct.description}</div>
          <div><b>Price:</b> {specificProduct.price} EGP</div>
          <div><b>Color:</b> {specificProduct.color}</div>
          <div><b>Size:</b> {specificProduct.size}</div>
          <button className={styles.closeBtn} onClick={() => setSpecificProduct(null)} type="button">Close</button>
        </div>
      )}

      {suserDetails && (
        <div className={styles.detailsCard}>
          <h3>User Details</h3>
          <div><b>id:</b> {suserDetails.id}</div>
          <div><b>name:</b> {suserDetails.name}</div>
          <div><b>email:</b> {suserDetails.email}</div>
          <div><b>phone:</b> {suserDetails.phone}</div>
          <div><b>Governorate:</b> {suserDetails.address}</div>
          <div><b>address:</b> {suserDetails.address}</div>
          <button className={styles.closeBtn} onClick={() => ssetUserDetails(null)} type="button">Close</button>
        </div>
      )}
    </>
  );
};

export default PaymentA;
