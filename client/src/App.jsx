import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './index.css';

function App() {
  const [leads, setLeads] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    source: 'Website',
    status: 'New',
    notes: ''
  });

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/leads');
      setLeads(response.data);
    } catch (error) {
      console.error('Error fetching leads:', error);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        // Update existing lead
        await axios.put(`http://localhost:5000/api/leads/${editingId}`, formData);
        setEditingId(null);
      } else {
        // Add new lead
        await axios.post('http://localhost:5000/api/leads', formData);
      }
      
      // Reset the form
      setFormData({ name: '', email: '', source: 'Website', status: 'New', notes: '' });
      fetchLeads();
    } catch (error) {
      console.error('Error saving lead:', error);
    }
  };

  const handleEdit = (lead) => {
    setFormData({
      name: lead.name,
      email: lead.email,
      source: lead.source,
      status: lead.status,
      notes: lead.notes || ''
    });
    setEditingId(lead.id);
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll up to the form
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this lead?')) {
      try {
        await axios.delete(`http://localhost:5000/api/leads/${id}`);
        fetchLeads();
      } catch (error) {
        console.error('Error deleting lead:', error);
      }
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({ name: '', email: '', source: 'Website', status: 'New', notes: '' });
  };

  return (
    <div className="container">
      <h1>Mini CRM - Leads</h1>

      <div className="card">
        <h2>{editingId ? 'Edit Lead' : 'Add New Lead'}</h2>
        <form onSubmit={handleSubmit} className="lead-form">
          <input 
            type="text" name="name" placeholder="Name" 
            value={formData.name} onChange={handleInputChange} required 
          />
          <input 
            type="email" name="email" placeholder="Email Address" 
            value={formData.email} onChange={handleInputChange} required 
          />
          <select name="source" value={formData.source} onChange={handleInputChange}>
            <option value="Website">Website</option>
            <option value="Referral">Referral</option>
            <option value="Cold Call">Cold Call</option>
            <option value="Social Media">Social Media</option>
          </select>
          {editingId && (
            <select name="status" value={formData.status} onChange={handleInputChange}>
              <option value="New">New</option>
              <option value="Contacted">Contacted</option>
              <option value="Converted">Converted</option>
            </select>
          )}
          <input 
            type="text" name="notes" placeholder="Notes (optional)" 
            value={formData.notes} onChange={handleInputChange} 
          />
          <div className="form-actions">
            <button type="submit" className="btn-primary">
              {editingId ? 'Update Lead' : 'Add Lead'}
            </button>
            {editingId && (
              <button type="button" className="btn-cancel" onClick={cancelEdit}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="card">
        <h2>Leads List</h2>
        <table className="leads-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Source</th>
              <th>Status</th>
              <th>Notes</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {leads.length > 0 ? (
              leads.map((lead) => (
                <tr key={lead.id}>
                  <td>{lead.name}</td>
                  <td>{lead.email}</td>
                  <td>{lead.source}</td>
                  <td>
                    <span className={`status ${lead.status.toLowerCase()}`}>
                      {lead.status}
                    </span>
                  </td>
                  <td>{lead.notes}</td>
                  <td className="actions-cell">
                    <button className="btn-edit" onClick={() => handleEdit(lead)}>Edit</button>
                    <button className="btn-delete" onClick={() => handleDelete(lead.id)}>Delete</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="empty-state">No leads available. Add one above!</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;
