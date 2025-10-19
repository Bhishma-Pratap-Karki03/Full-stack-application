import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../App";
import axios from "axios";
import "../styles/AdminContactManagement.css";
const API_BASE_URL = import.meta.env.VITE_API_URL;

interface ContactSubmission {
  _id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  createdAt: string;
  status?: "new" | "read" | "replied";
}

function AdminContactManagementPage() {
  const [contacts, setContacts] = useState<ContactSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedContact, setSelectedContact] =
    useState<ContactSubmission | null>(null);
  const [filter, setFilter] = useState<"all" | "new" | "read" | "replied">(
    "all"
  );
  const { isAuth, roleState } = useContext(AuthContext);

  useEffect(() => {
    if (!isAuth || roleState !== "admin") {
      return;
    }

    fetchContacts();
  }, [isAuth, roleState]);

  const fetchContacts = async () => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      const response = await axios.get(
        `${API_BASE_URL}/api/admin/contacts`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      setContacts(response.data.contacts || []);
    } catch (error) {
      console.error("Error fetching contacts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (contactId: string) => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      await axios.patch(
        `${API_BASE_URL}/api/admin/contacts/${contactId}/status`,
        { status: "read" },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      fetchContacts(); // Refresh the list
      // Update selectedContact if it's the same contact
      if (selectedContact?._id === contactId) {
        setSelectedContact({ ...selectedContact, status: "read" });
      }
    } catch (error) {
      console.error("Error marking contact as read:", error);
    }
  };

  const markAsReplied = async (contactId: string) => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      await axios.patch(
        `${API_BASE_URL}/api/admin/contacts/${contactId}/status`,
        { status: "replied" },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      fetchContacts(); // Refresh the list
      // Update selectedContact if it's the same contact
      if (selectedContact?._id === contactId) {
        setSelectedContact({ ...selectedContact, status: "replied" });
      }
    } catch (error) {
      console.error("Error marking contact as replied:", error);
    }
  };

  const deleteContact = async (contactId: string) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this contact submission?"
      )
    ) {
      return;
    }

    try {
      const accessToken = localStorage.getItem("accessToken");
      await axios.delete(
        `${API_BASE_URL}/api/admin/contacts/${contactId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      fetchContacts(); // Refresh the list
      if (selectedContact?._id === contactId) {
        setSelectedContact(null);
      }
    } catch (error) {
      console.error("Error deleting contact:", error);
    }
  };

  const filteredContacts = contacts.filter((contact) => {
    if (filter === "all") return true;
    return contact.status === filter;
  });

  if (!isAuth || roleState !== "admin") {
    return (
      <div className="admin-contact-container">
        <div className="access-denied">
          <h2>Access Denied</h2>
          <p>You need admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="admin-contact-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading contact submissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-contact-container">
      <div className="admin-contact-header">
        <h1>Contact Management</h1>
        <p>Manage user contact submissions and inquiries</p>
      </div>

      <div className="admin-contact-content">
        <div className="contact-list-section">
          <div className="contact-list-header">
            <h2>Contact Submissions</h2>
            <div className="filter-controls">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="filter-select"
              >
                <option value="all">All ({contacts.length})</option>
                <option value="new">
                  New (
                  {
                    contacts.filter((c) => c.status === "new" || !c.status)
                      .length
                  }
                  )
                </option>
                <option value="read">
                  Read ({contacts.filter((c) => c.status === "read").length})
                </option>
                <option value="replied">
                  Replied (
                  {contacts.filter((c) => c.status === "replied").length})
                </option>
              </select>
            </div>
          </div>

          <div className="contact-list">
            {filteredContacts.length === 0 ? (
              <div className="no-contacts">
                <p>No contact submissions found.</p>
              </div>
            ) : (
              filteredContacts.map((contact) => (
                <div
                  key={contact._id}
                  className={`contact-item ${
                    selectedContact?._id === contact._id ? "selected" : ""
                  } ${
                    contact.status === "new" || !contact.status ? "unread" : ""
                  }`}
                  onClick={() => setSelectedContact(contact)}
                >
                  <div className="contact-item-header">
                    <h3 className="contact-subject">{contact.subject}</h3>
                    <span
                      className={`contact-status ${contact.status || "new"}`}
                    >
                      {contact.status || "new"}
                    </span>
                  </div>
                  <div className="contact-item-details">
                    <div className="contact-info-row">
                      <p className="contact-name">{contact.name}</p>
                      <p className="contact-phone">{contact.phone}</p>
                    </div>
                    <p className="contact-email">{contact.email}</p>
                    <p className="contact-date">
                      {new Date(contact.createdAt).toLocaleDateString()} at{" "}
                      {new Date(contact.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="contact-detail-section">
          {selectedContact ? (
            <div className="contact-detail">
              {/* BASIC INFORMATION SECTION - TOP */}
              <div className="contact-basic-info">
                <h2>{selectedContact.subject}</h2>
                <div className="contact-info-grid">
                  <div className="info-item">
                    <span className="info-label">From:</span>
                    <span className="info-value">{selectedContact.name}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Email:</span>
                    <span className="info-value">{selectedContact.email}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Phone:</span>
                    <span className="info-value">{selectedContact.phone}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Date:</span>
                    <span className="info-value">
                      {new Date(selectedContact.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Status:</span>
                    <span
                      className={`status-badge ${
                        selectedContact.status || "new"
                      }`}
                    >
                      {selectedContact.status || "new"}
                    </span>
                  </div>
                </div>
              </div>

              {/* MESSAGE CONTENT SECTION - MIDDLE */}
              <div className="contact-message">
                <h3>Message Content</h3>
                <div className="message-content">{selectedContact.message}</div>
              </div>

              {/* ACTION BUTTONS SECTION - BOTTOM */}
              <div className="contact-actions">
                <button
                  onClick={() => markAsRead(selectedContact._id)}
                  className="action-btn read-btn"
                  disabled={
                    selectedContact.status === "read" ||
                    selectedContact.status === "replied"
                  }
                >
                  Mark as Read
                </button>
                <button
                  onClick={() => markAsReplied(selectedContact._id)}
                  className="action-btn reply-btn"
                  disabled={selectedContact.status === "replied"}
                >
                  Mark as Replied
                </button>
                <button
                  onClick={() => deleteContact(selectedContact._id)}
                  className="action-btn delete-btn"
                >
                  Delete Submission
                </button>
              </div>
            </div>
          ) : (
            <div className="no-selection">
              <div>
                <h3>Contact Details</h3>
                <p>
                  Select a contact submission from the list to view full details
                  and message content.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminContactManagementPage;
