import React, { useEffect, useState } from "react";
import Nav from "../Nav/Nav";
import { Space, Table, Tag, Button } from "antd";
import axios from "axios";
import styles from "./admin.module.css";

const Users = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const response = await axios.get("http://127.0.0.1:8000/api/show_users", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setUsers(response.data.data);
    };
    fetchUsers();
  }, []);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://127.0.0.1:8000/api/delete_user/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setUsers(users.filter((u) => u.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const toggleActive = async (id, isActive) => {
    try {
      await axios.patch(
        `http://127.0.0.1:8000/api/inactivate_user/${id}`,
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      setUsers(
        users.map((u) =>
          u.id === id ? { ...u, is_active: isActive ? 0 : 1 } : u
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
    },
    {
      title: "Governorate",
      dataIndex: "governorate",
      key: "governorate",
    },
    {
      title: "Address",
      dataIndex: "address",
      key: "address",
    },
    {
      title: "Status",
      key: "is_active",
      dataIndex: "is_active",
      render: (isActive) => (
        <Tag color={isActive ? "green" : "volcano"}>
          {isActive ? "Active" : "Inactive"}
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="primary"
            danger
            onClick={() => handleDelete(record.id)}
          >
            Delete
          </Button>
          <Button
            type={record.is_active ? "default" : "primary"}
            onClick={() => toggleActive(record.id, record.is_active)}
          >
            {record.is_active ? "Deactivate" : "Activate"}
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Nav />
      <div className={styles.pageWrapper}>
        <h1 className={styles.pageTitle} style={{ textAlign: "center" }} >Users Data</h1>
        <div className={styles.tableWrapper}>
          <Table
            columns={columns}
            dataSource={users}
            rowKey="id"
           
          />
        </div>
      </div>
    </>
  );
};

export default Users;
