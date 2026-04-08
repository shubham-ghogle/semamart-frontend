import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useSupportStore } from '@/store/supportStore';
import { useUserStore } from '@/store/userStore';
import { Eye } from "lucide-react";
import { getAccountOwnerEmail, getAccountOwnerId } from "@/lib/utils";

const UserSupportScreen = () => {
  const navigate = useNavigate();
  const { tickets, createTicket, fetchTickets } = useSupportStore();
  const user = useUserStore(s => s.user);
  const accountOwnerEmail = getAccountOwnerEmail(user);
  const accountOwnerId = getAccountOwnerId(user);

  const [topic, setTopic] = useState('');
  const [message, setMessage] = useState('');
  const [files, setFiles] = useState<FileList | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState('');

  useEffect(() => {
    fetchTickets('User');
  }, [fetchTickets]);

  // Filter tickets for current user
  const userTickets = tickets.filter(ticket => {
    if (typeof ticket.user === 'string') {
      return ticket.user === accountOwnerEmail || ticket.user === accountOwnerId;
    } else {
      return ticket.user._id === accountOwnerId || ticket.user.email === accountOwnerEmail;
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !accountOwnerEmail) return;

    // Validate fields - check if message is not just empty HTML tags
    const strippedMessage = message.replace(/<[^>]*>/g, '').trim();
    if (!topic.trim() || !strippedMessage || !files || files.length === 0) {
      setShowError('Please fill in all required fields (Topic, Message, and Documents) before submitting.');
      setTimeout(() => setShowError(''), 3000);
      return;
    }

    // Validate file types
    const allowedFileTypes = ['.pdf', '.jpg', '.jpeg', '.png', '.xlsx', '.doc', '.docx'];
    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
        if (!allowedFileTypes.includes(fileExtension)) {
          setShowError(`Unsupported file type: ${file.name}. Please upload only PDF, JPG, PNG, XLSX, DOC, or DOCX files.`);
          setTimeout(() => setShowError(''), 3000);
          return;
        }
      }
    }

    // Prepare documents
    const documentList = [];
    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        documentList.push(files[i]);
      }
    }

      await createTicket({
        userType: user.role === 'Seller' ? 'Seller' : user.role === 'Institute' ? 'Institute' : 'Customer',
      user: accountOwnerEmail, // Shared account uses the primary account email
      topic,
      message,
      documents: documentList,
    });

    // Show success message
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);

    setTopic('');
    setMessage('');
    setFiles(null);
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
        <h1 className="text-xl sm:text-2xl font-bold mb-4">Support</h1>
        
        {showSuccess && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
            Support request submitted successfully! Your case ID has been generated.
          </div>
        )}
        
        {showError && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {showError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mb-6 p-4 border rounded">
          <div className="mb-4">
            <label className="block mb-2 font-medium">Topic</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full border p-2 rounded"
              maxLength={255}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2 font-medium">Message</label>
            <ReactQuill
              value={message}
              onChange={setMessage}
              theme="snow"
              className="max-w-full"
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2 font-medium">Documents</label>
            <input
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png,.xlsx,.doc,.docx"
              onChange={(e) => setFiles(e.target.files)}
              className="border p-2 rounded w-full"
            />
          </div>
          <button 
            type="submit" 
            disabled={!topic.trim() || !message.replace(/<[^>]*>/g, '').trim() || !files || files.length === 0} 
            className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors w-full sm:w-auto"
          >
            Submit
          </button>
        </form>
        
        <h2 className="text-lg sm:text-xl font-bold mb-4">My Cases</h2>
        <div className="overflow-x-auto">
          <table className="w-full border">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 border">Case ID</th>
                <th className="p-2 border">Topic</th>
                <th className="p-2 border">Status</th>
                <th className="p-2 border">Action</th>
              </tr>
            </thead>
            <tbody>
              {userTickets.map(c => (
                <tr key={c._id} className="border-t">
                  <td className="p-2 border">{c.caseId}</td>
                  <td className="p-2 border">{c.topic}</td>
                  <td className="p-2 border">{c.status}</td>
                    <td className="p-2 border">
                      <button 
                        onClick={() => navigate(`/account/support/${c._id}`)} 
                        className="text-blue-500 hover:text-blue-700 p-1 rounded"
                        title="View Ticket Details"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserSupportScreen;
