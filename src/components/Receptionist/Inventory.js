import React, { useState, useEffect } from 'react';
import { Table, Button, Form, Modal, Spinner, Alert } from 'react-bootstrap';
import axios from 'axios';
import 'tailwindcss/tailwind.css'; // Assuming you're using Tailwind for layout/styling.
import { network_url } from '../Network/networkConfig';
import { formatPrice } from '../utils/FormatPrice';

const InventoryManager = () => {
    const [inventoryItems, setInventoryItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [newItem, setNewItem] = useState({
        name: '',
        type: '',
        description: '',
        stockQuantity: '',
        price: '',
        costPrice: ""
    });
    const [editingItem, setEditingItem] = useState(null); // To handle editing
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null); // For modal deletion
    const [saveLoading, setSaveLoading] = useState(false); // Loading state for saving/editing

    useEffect(() => {
        fetchInventoryItems();
    }, []);

    const fetchInventoryItems = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${network_url}/api/Inventory`);
            setInventoryItems(response.data);
        } catch (error) {
            console.error("Error fetching inventory items:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddItem = async (e) => {
        e.preventDefault();
        try {
            setSaveLoading(true);
            const response = await axios.post(`${network_url}/api/Inventory`, newItem);
            setInventoryItems([...inventoryItems, response.data]);
            setNewItem({
                name: '',
                type: '',
                description: '',
                stockQuantity: '',
                price: '',
            });
        } catch (error) {
            console.error("Error adding item:", error);
        } finally {
            setSaveLoading(false);
        }
    };

    const handleDeleteItem = async () => {
        try {
            await axios.delete(`${network_url}/api/Inventory/${itemToDelete}`);
            setInventoryItems(inventoryItems.filter(item => item.inventoryItemID !== itemToDelete));
            setShowDeleteModal(false);
        } catch (error) {
            console.error("Error deleting item:", error);
        }
    };

    const handleEditItem = async (item) => {
        setEditingItem(item); // Enables the edit mode
    };

    const handleSaveEdit = async () => {
        try {
            setSaveLoading(true);
            await axios.put(`${network_url}/api/Inventory/${editingItem.inventoryItemID}`, editingItem);
            setInventoryItems(inventoryItems.map(item => item.inventoryItemID === editingItem.inventoryItemID ? editingItem : item));
            setEditingItem(null); // Disable edit mode
        } catch (error) {
            console.error("Error updating item:", error);
        } finally {
            setSaveLoading(false);
        }
    };

    const handleInputChange = (e, field, isEditing = false) => {
        const { value } = e.target;
        if (isEditing) {
            setEditingItem(prev => ({ ...prev, [field]: value }));
        } else {
            setNewItem(prev => ({ ...prev, [field]: value }));
        }
    };

    const handleDeleteModal = (itemID) => {
        setItemToDelete(itemID);
        setShowDeleteModal(true);
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Manage Inventory</h1>

            {/* Add Inventory Form */}
            <Form onSubmit={handleAddItem} className="mb-4 grid grid-cols-4 gap-2">
                <Form.Group>
                    <Form.Control 
                        type="text" 
                        placeholder="Item Name" 
                        value={newItem.name} 
                        onChange={(e) => handleInputChange(e, 'name')} 
                        required 
                    />
                </Form.Group>
                <Form.Group>
                    <Form.Control 
                        type="text" 
                        placeholder="Type (e.g., Medicine, Test)" 
                        value={newItem.type} 
                        onChange={(e) => handleInputChange(e, 'type')} 
                        required 
                    />
                </Form.Group>
                <Form.Group>
                    <Form.Control 
                        type="text" 
                        placeholder="Description" 
                        value={newItem.description} 
                        onChange={(e) => handleInputChange(e, 'description')} 
                    />
                </Form.Group>
                <Form.Group>
                    <Form.Control 
                        type="number" 
                        placeholder="Stock Quantity" 
                        value={newItem.stockQuantity} 
                        onChange={(e) => handleInputChange(e, 'stockQuantity')} 
                        required 
                    />
                </Form.Group>
                <Form.Group>
                    <Form.Control 
                        type="number" 
                        placeholder="Cost Price" 
                        value={newItem.costPrice} 
                        onChange={(e) => handleInputChange(e, 'costPrice')} 
                        required 
                    />
                </Form.Group>
                <Form.Group>
                    <Form.Control 
                        type="number" 
                        placeholder="Selling Price" 
                        value={newItem.price} 
                        onChange={(e) => handleInputChange(e, 'price')} 
                        required 
                    />
                </Form.Group>
                <Button type="submit" variant="primary" disabled={saveLoading}>
                    {saveLoading ? <Spinner animation="border" size="sm" /> : 'Add Item'}
                </Button>
            </Form>

            {/* Inventory Table */}
            {loading ? (
                <Spinner animation="border" />
            ) : (
                <Table striped bordered hover>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Type</th>
                            <th>Description</th>
                            <th>Stock</th>
                            <th>Cost Price</th>
                            <th>Selling Price</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {inventoryItems.map(item => (
                            <tr key={item.inventoryItemID}>
                                {editingItem && editingItem.inventoryItemID === item.inventoryItemID ? (
                                    <>
                                        <td>
                                            <Form.Control 
                                                type="text" 
                                                value={editingItem.name} 
                                                onChange={(e) => handleInputChange(e, 'name', true)} 
                                            />
                                        </td>
                                        <td>
                                            <Form.Control 
                                                type="text" 
                                                value={editingItem.type} 
                                                onChange={(e) => handleInputChange(e, 'type', true)} 
                                            />
                                        </td>
                                        <td>
                                            <Form.Control 
                                                type="text" 
                                                value={editingItem.description} 
                                                onChange={(e) => handleInputChange(e, 'description', true)} 
                                            />
                                        </td>
                                        <td>
                                            <Form.Control 
                                                type="number" 
                                                value={editingItem.stockQuantity} 
                                                onChange={(e) => handleInputChange(e, 'stockQuantity', true)} 
                                            />
                                        </td>
                                        <td>
                                            <Form.Control 
                                                type="number" 
                                                value={editingItem.costPrice} 
                                                onChange={(e) => handleInputChange(e, 'costPrice', true)} 
                                            />
                                        </td>
                                        <td>
                                            <Form.Control 
                                                type="number" 
                                                value={editingItem.price} 
                                                onChange={(e) => handleInputChange(e, 'price', true)} 
                                            />
                                        </td>
                                        <td>
                                            <Button variant="success" onClick={handleSaveEdit}>
                                                {saveLoading ? <Spinner animation="border" size="sm" /> : 'Save'}
                                            </Button>
                                        </td>
                                    </>
                                ) : (
                                    <>
                                        <td>{item.name}</td>
                                        <td>{item.type}</td>
                                        <td>{item.description}</td>
                                        <td>{item.stockQuantity}</td>
                                        <td>{formatPrice(item.costPrice)}</td>
                                        <td>{formatPrice(item.price)}</td>
                                        <td>
                                            <Button variant="warning" onClick={() => handleEditItem(item)}>Edit</Button>{' '}
                                            <Button variant="danger" onClick={() => handleDeleteModal(item.inventoryItemID)}>Delete</Button>
                                        </td>
                                    </>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </Table>
            )}

            {/* Delete Confirmation Modal */}
            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Delete</Modal.Title>
                </Modal.Header>
                <Modal.Body>Are you sure you want to delete this item?</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={handleDeleteItem}>
                        Delete
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default InventoryManager;
