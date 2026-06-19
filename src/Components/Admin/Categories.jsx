import React, { useEffect, useState } from 'react';
import Nav from '../Nav/Nav';
import axios from 'axios';
import { Button, Form, Input } from 'antd';
import styles from './categories.module.css';

const Categories = () => {
  const [Category, setCategory] = useState([]);
  const [updateCategory, setUpdateCategory] = useState({ name: '' });
  const [formVisible, setFormVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form] = Form.useForm(); // <--- create form instance

  const handleEdit = (category) => {
    setFormVisible(true);
    setEditingId(category.id);
    setUpdateCategory({ name: category.name });
    form.setFieldsValue({ name: category.name }); // <--- update form field value
  };


  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:8000/api/delete_category/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  const handlesubmit = async () => {
    if (editingId !== null) {
      try {
        await axios.patch(
          `http://localhost:8000/api/update_category/${editingId}`,
          updateCategory,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json'
            }
          }
        );
        setFormVisible(false);
        setEditingId(null);
        fetchCategories();
      } catch (error) {
        console.error('Error updating category:', error);
      }
    } else {
      try {
        await axios.post(
          `http://localhost:8000/api/add_category`,
          updateCategory,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json'
            }
          }
        );
        setFormVisible(false);
        fetchCategories();
      } catch (error) {
        console.error('Error Adding category:', error);
      }
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(
        'http://localhost:8000/api/show_categories',
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      setCategory(response.data.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <>
      <Nav />
      <div className={styles.adminCategoriesContainer}>
        <button
          onClick={() => {
            setFormVisible(true);
            setEditingId(null);
            setUpdateCategory({ name: '' });
            form.resetFields(); // reset when adding new
          }}
          className={styles.addBtn}
        >
          add Category
        </button>

        <table className={styles.categoriesTable}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Category Name</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {Category.map((category) => (
              <tr key={category.id}>
                <td>{category.id}</td>
                <td>{category.name}</td>
                <td>
                  <button
                    className={styles.actionBtn}
                    onClick={() => handleEdit(category)}
                  >
                    Edit
                  </button>
                  <button
                    className={styles.actionBtn}
                    onClick={() => handleDelete(category.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {formVisible && (
          <div className={styles.formWrapper}>
            <Form
              layout="vertical"
              className={styles.formWrapper}
              onFinish={handlesubmit}
              initialValues={{ name: updateCategory.name }}
              autoComplete="off"
            >
              <Form.Item
                label="Category Name"
                name="name"
                rules={[
                  { required: true, message: 'Please input category name!' }
                ]}
              >
                <Input
                  value={updateCategory.name}
                  onChange={(e) =>
                    setUpdateCategory({
                      ...updateCategory,
                      name: e.target.value
                    })
                  }
                />
              </Form.Item>
              <Form.Item label={null}>
                <Button type="primary" htmlType="submit">
                  {editingId !== null ? 'Update Category' : 'Add Category'}
                </Button>
              </Form.Item>
            </Form>
          </div>
        )}
      </div>
    </>
  );
};

export default Categories;
