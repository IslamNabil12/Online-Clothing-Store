import React, { useEffect, useState } from "react";
import {
  Table,
  Space,
  Button,
  Input,
  Modal,
  Form,
  Upload,
  Switch,
  InputNumber,
  message,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import axios from "axios";
import styles from "./product.module.css";
import Nav from "../Nav/Nav";

const { Search } = Input;
const backendURL = "http://127.0.0.1:8000";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [currentRecord, setCurrentRecord] = useState(null); // Add this to store current record
  const [removedImageIds, setRemovedImageIds] = useState([]); // Track removed images

  const [form] = Form.useForm();
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const authHeaders = token
    ? { Authorization: `Bearer ${token}` }
    : undefined;

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${backendURL}/api/show_product_admin`, {
        headers: authHeaders,
      });
      const list = res?.data?.data || [];
      setProducts(list);
      setFiltered(list);
    } catch (err) {
      message.error("Failed to fetch products");
      // Optional: console for debug
      // console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value) => {
    const v = value?.trim()?.toLowerCase() || "";
    if (!v) {
      setFiltered(products);
      return;
    }
    const res = products.filter((p) =>
      String(p.name || "").toLowerCase().includes(v)
    );
    setFiltered(res);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${backendURL}/api/delete_product/${id}`, {
        headers: authHeaders,
      });
      message.success("Product deleted");
      fetchProducts();
    } catch (err) {
      message.error("Failed to delete product");
      // console.error(err);
    }
  };

  const handleToggleActive = async (id, isActive) => {
    try {
      await axios.patch(
        `${backendURL}/api/inactivate_product/${id}`,
        {},
        { headers: authHeaders }
      );
      message.success(`Product ${isActive ? "Deactivated" : "Activated"}`);
      fetchProducts();
    } catch (err) {
      message.error("Failed to update status");
      // console.error(err);
    }
  };

  const handleAdd = () => {
    setIsEdit(false);
    setCurrentId(null);
    setCurrentRecord(null);
    setRemovedImageIds([]); // Reset removed images
    form.resetFields();
    // sensible defaults to satisfy validation
    form.setFieldsValue({
      is_active: true,
      category_id: undefined,
    });
    setIsModalOpen(true);
  };

  const handleEdit = (record) => {
    console.log('Editing record:', record); // Debug log
    setIsEdit(true);
    setCurrentId(record.id);
    setCurrentRecord(record);
    setRemovedImageIds([]); // Reset removed images for new edit
    
    // First set modal open to ensure form is rendered
    setIsModalOpen(true);
    
    // Use setTimeout to ensure form is fully rendered before setting values
    setTimeout(() => {
      form.resetFields();
      
      // Convert existing images to Upload component format
      const existingImages = [];
      if (Array.isArray(record.images) && record.images.length > 0) {
        record.images.forEach((img, index) => {
          const imageUrl = String(img).startsWith("http") ? img : `${backendURL}${img}`;
          existingImages.push({
            uid: `existing-${index}`, // Unique identifier
            name: `existing-image-${index + 1}`, // Display name
            status: 'done', // Upload status
            url: imageUrl, // Image URL for display
            thumbUrl: imageUrl, // Thumbnail URL
            isExisting: true, // Flag to identify existing images
            originalPath: img, // Store original path for backend reference
          });
        });
      }
      
      const formValues = {
        name: record.name || '',
        price: record.price || 0,
        stock: record.stock || 0,
        size: record.size || '',
        color: record.color || '',
        description: record.description || '',
        is_active: Boolean(record.is_active),
        category_id: record.category_id || null,
        images: existingImages,
      };
      console.log('Setting form values:', formValues); // Debug log
      form.setFieldsValue(formValues);
    }, 100);
  };

  // Convert AntD Upload event -> fileList array
  const normFileList = (e) => (Array.isArray(e) ? e : e?.fileList || []);

  const onFinish = async (values) => {
    // Build form-data according to backend validation
    const formData = new FormData();

    // Required by backend
    // name, price, size, color, stock, is_active (1/0), category_id
    formData.append("name", values.name);
    formData.append("price", values.price);
    formData.append("stock", values.stock);
    formData.append("size", values.size || "");
    formData.append("color", values.color || "");
    formData.append("description", values.description || "");
    // Send 1/0 as requested
    formData.append("is_active", values.is_active ? 1 : 0);
    formData.append("category_id", values.category_id);

    // Images: append as images[]
    const files = values.images || [];
    files.forEach((f) => {
      if (f.originFileObj) {
        formData.append("images[]", f.originFileObj);
      }
    });

    try {
      setLoading(true);

      if (isEdit) {
        // Your route uses POST to /update_product/{id}
        await axios.post(
          `${backendURL}/api/update_product/${currentId}`,
          formData,
          {
            headers: {
              ...authHeaders,
              "Content-Type": "multipart/form-data",
            },
          }
        );
        message.success("Product updated successfully");
      } else {
        await axios.post(`${backendURL}/api/add_product`, formData, {
          headers: {
            ...authHeaders,
            "Content-Type": "multipart/form-data",
          },
        });
        message.success("Product added successfully");
      }

      setIsModalOpen(false);
      fetchProducts();
    } catch (err) {
      // Surface Laravel validation errors (422)
      if (err.response?.status === 422) {
        const errs = err.response?.data?.errors;
        if (errs) {
          const flat = Object.entries(errs)
            .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
            .join("\n");
          message.error(`Validation failed:\n${flat}`);
        } else {
          message.error("Validation failed (422). Please check your inputs.");
        }
      } else {
        message.error("Error saving product");
      }
      // console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { title: "Prod.ID", dataIndex: "id", key: "id", width: 70 },
    { title: "Product Name", dataIndex: "name", key: "name" },
    { title: "Price", dataIndex: "price", key: "price" },
    { title: "Stock", dataIndex: "stock", key: "stock" },
    { title: "Size", dataIndex: "size", key: "size" },
    { title: "Color", dataIndex: "color", key: "color" },
    {
      title: "Images",
      key: "images",
      render: (_, record) => (
        <div className={styles.imageContainer}>
          {Array.isArray(record.images) && record.images.length > 0 ? (
            record.images.map((img, i) => (
              <img
                key={i}
                src={String(img).startsWith("http") ? img : `${backendURL}${img}`}
                alt={`product-${record.name || "item"}-${i}`}
                className={styles.productImage}
              />
            ))
          ) : (
            <span className={styles.noImage}>No Images</span>
          )}
        </div>
      ),
    },
    {
      title: "Status",
      key: "is_active",
      render: (_, record) => (
        <span className={record.is_active ? styles.active : styles.inactive}>
          {record.is_active ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      title: "Actions",
      key: "action",
      render: (_, record) => (
        <Space wrap>
          <Button icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            Edit
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          >
            Delete
          </Button>
          <Button onClick={() => handleToggleActive(record.id, record.is_active)}>
            {record.is_active ? "Deactivate" : "Activate"}
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Nav />
      <div className={styles.adminPage}>
        <div className={styles.header}>
          <Search
            placeholder="Search product by name"
            onSearch={handleSearch}
            allowClear
            enterButton
            className={styles.search}
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
            className={styles.addBtn}
          >
            Add Product
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={filtered}
          rowKey="id"
          loading={loading}
          className={styles.table}
        />

        <Modal
          title={isEdit ? "Edit Product" : "Add Product"}
          open={isModalOpen}
          onCancel={() => {
            setIsModalOpen(false);
            setRemovedImageIds([]); // Reset removed images when canceling
            form.resetFields();
          }}
          onOk={() => form.submit()}
          okText={isEdit ? "Update" : "Create"}
          confirmLoading={loading}
          destroyOnClose={false}
          forceRender={true}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            preserve={true}
            initialValues={{
              is_active: true,
            }}
          >
            <Form.Item
              name="name"
              label="Product Name"
              rules={[{ required: true, message: "Name is required" }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="price"
              label="Price"
              rules={[{ required: true, message: "Price is required" }]}
            >
              <InputNumber style={{ width: "100%" }} min={0} />
            </Form.Item>

            <Form.Item
              name="stock"
              label="Stock"
              rules={[{ required: true, message: "Stock is required" }]}
            >
              <InputNumber style={{ width: "100%" }} min={0} />
            </Form.Item>

            <Form.Item
              name="size"
              label="Size"
              rules={[{ required: true, message: "Size is required" }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="color"
              label="Color"
              rules={[{ required: true, message: "Color is required" }]}
            >
              <Input />
            </Form.Item>

            <Form.Item name="description" label="Description">
              <Input.TextArea rows={3} />
            </Form.Item>

            <Form.Item
              name="category_id"
              label="Category ID"
              rules={[{ required: true, message: "Category ID is required" }]}
            >
              <InputNumber style={{ width: "100%" }} min={1} />
            </Form.Item>

            <Form.Item
              name="is_active"
              label="Active?"
              valuePropName="checked"
              tooltip="Will be sent to the backend as 1 (active) or 0 (inactive)"
            >
              <Switch />
            </Form.Item>

            <Form.Item
              name="images"
              label="Upload Images"
              valuePropName="fileList"
              getValueFromEvent={normFileList}
              extra="JPG, JPEG, PNG, WEBP. Max 2MB each. Existing images are shown below - you can add new ones or remove existing ones."
            >
              <Upload
                listType="picture-card"
                multiple
                beforeUpload={() => false} // prevent auto-upload; we use FormData
                accept=".jpg,.jpeg,.png,.webp"
                onRemove={(file) => {
                  // Track removed existing images
                  if (file.isExisting && file.originalPath) {
                    setRemovedImageIds(prev => [...prev, file.originalPath]);
                  }
                  return true; // Allow removal
                }}
                onPreview={async (file) => {
                  // Handle preview of images
                  if (file.url || file.preview) {
                    const image = new Image();
                    image.src = file.url || file.preview;
                    const imgWindow = window.open(file.url || file.preview);
                    imgWindow?.document.write(image.outerHTML);
                  }
                }}
              >
                <div>
                  <UploadOutlined />
                  <div style={{ marginTop: 8 }}>Upload</div>
                </div>
              </Upload>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </>
  );
};

export default Products;