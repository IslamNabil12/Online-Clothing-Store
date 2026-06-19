import React from "react";
import { Button, Form, Input, message } from "antd";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import style2 from "../css/style2.module.css";

const Register = () => {
  const navigate = useNavigate();

  const handleSubmit = async (values) => {
    try {
      let response = await axios.post("http://127.0.0.1:8000/api/register", values);

      localStorage.setItem("token", response.data.token);
      message.success("Register successful");
      console.log("Register successful:", response.data);
      navigate("/login");
    } catch (error) {
      console.error("Register error:", error.response ? error.response.data : error.message);
      message.error(error.response?.data?.message || "Register failed");
    }
  };

  return (
    <div className={style2.container}>
      <Form
        className={style2.form}
        name="register"
        layout="horizontal"
        labelCol={{ xs: { span: 24 }, sm: { span: 8 } }}
        wrapperCol={{ xs: { span: 24 }, sm: { span: 16 } }}
        style={{ maxWidth: 600 }}
        onFinish={handleSubmit}
        autoComplete="off"
      >
        <Form.Item label="Username" name="name" rules={[{ required: true, message: "Please input your username!" }]}>
          <Input />
        </Form.Item>

        <Form.Item label="Email" name="email" rules={[{ required: true, type: "email", message: "Please input a valid email!" }]}>
          <Input />
        </Form.Item>

        <Form.Item label="Governorate" name="governorate">
          <Input />
        </Form.Item>

        <Form.Item label="Address" name="address">
          <Input />
        </Form.Item>

        <Form.Item label="Phone" name="phone">
          <Input />
        </Form.Item>

        <Form.Item label="Password" name="password" rules={[{ required: true, message: "Please input your password!" }]}>
          <Input.Password />
        </Form.Item>

        <Form.Item
          label="Password Confirmation"
          name="password_confirmation"
          dependencies={["password"]}
          rules={[
            { required: true, message: "Please confirm your password!" },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("password") === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error("Passwords do not match!"));
              },
            }),
          ]}
        >
          <Input.Password />
        </Form.Item>

        <h3>
          If you already have an account, please <a href="/login">Login</a>
        </h3>

        <Form.Item wrapperCol={{ xs: { span: 24 }, sm: { offset: 8, span: 16 } }}>
          <Button type="primary" htmlType="submit" block>
            Register
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Register;
