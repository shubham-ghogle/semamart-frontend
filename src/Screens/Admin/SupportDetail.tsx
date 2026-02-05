import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useUserStore } from '@/store/userStore';
import { useSupportStore } from '@/store/supportStore';

const SupportDetail = () => {
  const { id } = useParams<{id: string}>();
  const user = useUserStore(s => s.user);
  const { getTicketById, updateTicketStatus, addMessage } = useSupportStore();
  const isAdmin = user?.role === 'Admin';

  const ticket = getTicketById(id || '');

  const [reply, setReply] = useState('');
  const [status, setStatus] = useState(ticket?.status || 'New');

  useEffect(() => {
    if (ticket) {
      setStatus(ticket.status);
    }
  }, [ticket]);

  const handleReply = async () => {
    if (!reply.trim() || !ticket) return;
    await addMessage(ticket._id, {
      from: isAdmin ? 'Admin' : (user?.role === 'Seller' ? 'Seller' : 'User'),
      message: reply,
      date: new Date().toISOString().split('T')[0],
    });
    setReply('');
  };

  const handleStatusChange = async () => {
    if (!ticket) return;
    await updateTicketStatus(ticket._id, status as any);
  };

  const handleDownloadDocument = (doc: string) => {
    // For demo purposes, we'll just log the document
    console.log('Downloading document:', doc);
  };

  if (!ticket) {
    return <div className="p-6">Ticket not found</div>;
  }

  const userDetails = typeof ticket.user === 'object' ? ticket.user : null;

  return (
    <div className="p-4 sm:p-6">
      <h1 className="text-xl sm:text-2xl font-bold mb-4">Case {ticket.caseId}</h1>
      <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p><strong>Topic:</strong> {ticket.topic}</p>
          <p><strong>Status:</strong> 
            <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
              ticket.status === 'New' ? 'bg-blue-100 text-blue-800' :
              ticket.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
              'bg-green-100 text-green-800'
            }`}>
              {ticket.status}
            </span>
          </p>
          <p><strong>Submitted:</strong> {new Date(ticket.createdAt).toLocaleString()}</p>
          <p><strong>Last Updated:</strong> {new Date(ticket.updatedAt).toLocaleString()}</p>
        </div>
        {userDetails && (
          <div className="p-4 bg-gray-50 rounded">
            <h3 className="font-semibold mb-2">User Information</h3>
            <p><strong>Name:</strong> {userDetails.firstName} {userDetails.lastName}</p>
            <p><strong>Email:</strong> {userDetails.email}</p>
            <p><strong>Phone:</strong> {userDetails.phoneNumber}</p>
            {userDetails.instituteName && <p><strong>Institute:</strong> {userDetails.instituteName}</p>}
            <p><strong>User Type:</strong> {ticket.userType}</p>
          </div>
        )}
      </div>
      
      <div className="mb-4 p-4 bg-gray-50 rounded">
        <h3 className="font-semibold mb-2">Complaint Description</h3>
        <p>{ticket.message}</p>
      </div>
      
      {ticket.documents.length > 0 && (
        <div className="mb-4">
          <h3 className="font-semibold mb-2">Supporting Documents ({ticket.documents.length})</h3>
          <ul className="space-y-2">
            {ticket.documents.map((doc, index) => (
              <li key={index} className="flex items-center">
                <a 
                  href={doc} 
                  onClick={(e) => {
                    e.preventDefault();
                    handleDownloadDocument(doc);
                  }}
                  className="text-blue-500 underline hover:text-blue-700 flex items-center"
                >
                  <span className="mr-2">📄</span>
                  Document {index + 1}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      <h2 className="text-lg sm:text-xl font-bold mb-4">Conversation</h2>
      <div className="mb-4">
        {ticket.conversation.map((c, i) => (
          <div key={c._id || i} className="border p-2 mb-2 rounded">
            <p><strong>{c.from}:</strong> {c.message}</p>
            <p className="text-sm text-gray-500">{c.date}</p>
          </div>
        ))}
      </div>
      
      {isAdmin && (
        <div className="mb-4">
          <label className="block mb-2 font-medium">Update Status</label>
          <div className="flex flex-col sm:flex-row gap-2">
            <select value={status} onChange={(e) => setStatus(e.target.value as any)} className="border p-2 rounded w-full sm:w-auto">
              <option>New</option>
              <option>In Progress</option>
              <option>Closed</option>
            </select>
            <button onClick={handleStatusChange} className="bg-blue-500 text-white px-4 py-2 rounded w-full sm:w-auto">Update Status</button>
          </div>
        </div>
      )}
      
      <div className="mb-4">
        <label className="block mb-2 font-medium">Reply</label>
        <textarea
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          placeholder="Type your reply"
          className="w-full border p-2 rounded"
          rows={4}
        />
        <button onClick={handleReply} className="bg-blue-500 text-white px-4 py-2 rounded mt-2 w-full sm:w-auto">Send Reply</button>
      </div>
    </div>
  );
};

export default SupportDetail;