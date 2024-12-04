import React, { useState, useEffect } from "react";
import { Modal, Button, Spinner, Form } from "react-bootstrap";

const InventoryModal = ({ show, inventoryItems, onHide, invoiceID, onAddInventoryItem }) => {
//   const [inventoryItems, setInventoryItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [quantity, setQuantity] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState(null);

 
  const handleSelection = (event) => {
    const selectedID = parseInt(event.target.value, 10);
    const item = inventoryItems.find((item) => item.inventoryItemID === selectedID);
    setSelectedItem(item || null);
    setQuantity("");
  };

  // Handle quantity input
  const handleQuantityChange = (event) => {
    setQuantity(event.target.value);
  };

  // Add item to invoice
  const handleAddToInvoice = async () => {
    if (!selectedItem || quantity < 1) return;

    setIsAdding(true);
    try {
      await onAddInventoryItem({
        invoiceID,
        inventoryItemID: selectedItem.inventoryItemID,
        quantity: parseInt(quantity, 10),
      });
      // Reset form
      setSelectedItem(null);
      setQuantity("");
      onHide();
    } catch (error) {
      setError("Failed to add inventory item to invoice.");
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Add Inventory Item to Invoice</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        {/* Inventory Item Dropdown */}
        <Form.Group>
          <Form.Label>Select Inventory Item</Form.Label>
          <Form.Select
            value={selectedItem?.inventoryItemID || ""}
            onChange={handleSelection}
            className="mb-3"
          >
            <option value="">-- Select an Item --</option>
            {inventoryItems && inventoryItems.map((item) => (
              <option key={item.inventoryItemID} value={item.inventoryItemID}>
                {`${item.name} - Rs. ${item.price}`}
              </option>
            ))}
          </Form.Select>
        </Form.Group>

        {/* Display Selected Item Details */}
        {selectedItem && (
          <div className="bg-gray-100 p-3 rounded-md mb-3">
            <p>
              <strong>Description:</strong> {selectedItem.description}
            </p>
            <p>
              <strong>Stock Quantity:</strong>{" "}
              <span
                className={`${
                  selectedItem.stockQuantity - quantity < 0 ? "text-red-500" : "text-black"
                }`}
              >
                {selectedItem.stockQuantity - (quantity || 0)}
              </span>
            </p>
          </div>
        )}

        {/* Quantity Input */}
        <Form.Group>
          <Form.Label>Quantity</Form.Label>
          <Form.Control
            type="number"
            min="1"
            value={quantity}
            onChange={handleQuantityChange}
            className="mb-3"
          />
        </Form.Group>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide} disabled={isAdding}>
          Close
        </Button>
        <Button
          variant="primary"
          onClick={handleAddToInvoice}
          disabled={!selectedItem || quantity < 1 || isAdding}
        >
          {isAdding ? <Spinner as="span" animation="border" size="sm" /> : "Add to Invoice"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default InventoryModal;
