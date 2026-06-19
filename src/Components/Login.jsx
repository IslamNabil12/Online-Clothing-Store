import React from 'react'
import { useState } from "react";
import { Button, Form, Input, message } from "antd";
import style1 from "../css/style.module.css";
import axios from "axios";

const Login = () => {
    const [loading, setLoading] = useState(false);
  
    const [user, setUser] = useState({
        email: "",
        password: "",
    });
   
   const handleSubmit = async () => {
  try {
    setLoading(true);
    let response = await axios.post("http://127.0.0.1:8000/api/login", {
      email: user.email,
      password: user.password,
    });
    
    // Save token
    localStorage.setItem("token", response.data.token);
    
    // Get user data after successful login
    try {
      const userResponse = await axios.get("http://localhost:8000/api/user", {
        headers: { Authorization: `Bearer ${response.data.token}` },
      });
      
      // Save user data to localStorage
      localStorage.setItem("user", JSON.stringify(userResponse.data));
      
      message.success("Login successful");
      console.log("Login successful:", response.data);
      window.location.href = "/home"; // Redirect to home after successful login
      
    } catch (userError) {
      console.error("Error fetching user data:", userError);
      // Still redirect even if user data fetch fails
      window.location.href = "/home";
    }
    
  } catch (error) {
    console.error("Login error:", error.response ? error.response.data : error.message);
    message.error(error.response?.data?.msg || "Login failed");
  }
  finally {
    setLoading(false);
  }
};

  return (
    <>
     {loading && (
            <div className={style1.loaderOverlay}>
              <div className={style1.loader}></div>
            </div>
          )}
       <div className={style1.container}>
      <Form
        className={style1.form}
        
        name="login"
        layout="vertical"
        style={{ maxWidth: 400, width: "100%" }}
        initialValues={{ remember: true }}
        onFinish={handleSubmit}
        autoComplete="off"
      >
          <div className={style1.logo} id="logo">Outi</div>
        <Form.Item
          label="email"
          name="email"
          rules={[
            { required: true, message: "Please input your email!" },
            { type: "email", message: "Enter a valid email!" },
          ]}
        >
          <Input placeholder="Enter your email"  onChange={(e) => setUser({ ...user, email: e.target.value })} />
        </Form.Item>
        <Form.Item
          label="password"
          name="password"
          rules={[{ required: true, message: "Please input your password!" }]}
        >
          <Input.Password placeholder="Enter your password" onChange={(e) => setUser({ ...user, password: e.target.value })} />
        </Form.Item>
        <p style={{ textAlign: "center", marginBottom: "1rem" }}>
          Don't have an account? <a href="/register">Register</a>
        </p>
        <Form.Item>
          <Button type="primary" htmlType="submit" block>
            Login
          </Button>
        </Form.Item>
      </Form>
    </div>
    </>
  )
}

export default Login