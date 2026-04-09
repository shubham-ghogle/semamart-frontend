import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarPopoverWithPresets } from "@/components/UIComponents/CalendarPopoverWithPresets";
import { useSupportStore } from '@/store/supportStore';

const AdminSupportScreen = () => {
  const navigate = useNavigate();
  const { tickets, fetchTickets } = useSupportStore();

  useEffect(() => {
    fetchTickets('Admin');
  }, [fetchTickets]);

  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();

  const filteredCases = tickets.filter(c => {
    console.log('Checking ticket:', c);
    const userDetails = typeof c.user === 'object' ? c.user : null;
    const userName = userDetails ? `${userDetails.firstName} ${userDetails.lastName}` : (typeof c.user === 'string' ? c.user : '');
    const caseCreatedAt = new Date(c.createdAt);

    // Search filter
    const matchesSearch = c.caseId.toLowerCase().includes(search.toLowerCase()) ||
      userName.toLowerCase().includes(search.toLowerCase()) ||
      c.topic.toLowerCase().includes(search.toLowerCase());

    // Date range filter
    const matchesDateRange = (!startDate || caseCreatedAt >= startDate) &&
      (!endDate || caseCreatedAt <= endDate);

    const result = matchesSearch && matchesDateRange;
    console.log('Ticket matches:', result);
    return result;
  });

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'New':
      case 'Open':
        return 'bg-blue-100 text-blue-800';
      case 'In Progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'Closed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
        <h1 className="text-xl sm:text-2xl font-bold mb-4">Support Management</h1>
        <div className="mb-4 flex flex-nowrap items-center gap-2 overflow-x-auto">
          <input
            type="text"
            placeholder="Search by Case ID, Name, Topic"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border p-2 rounded min-w-[180px] flex-1"
          />
          
          <CalendarPopoverWithPresets
            startDate={startDate}
            endDate={endDate}
            setStartDate={setStartDate}
            setEndDate={setEndDate}
            minDate={new Date(2020, 0, 1)}
          />
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full border">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 border">Case ID</th>
                <th className="p-2 border">User Type</th>
                <th className="p-2 border">Name</th>
                <th className="p-2 border">Topic</th>
                <th className="p-2 border">Status</th>
                <th className="p-2 border">Submission Date</th>
                <th className="p-2 border">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredCases.map(c => {
                const userDetails = typeof c.user === 'object' ? c.user : null;
                const userDisplayName = userDetails ? `${userDetails.firstName} ${userDetails.lastName}` : (typeof c.user === 'string' ? c.user : 'N/A');
                return (
                  <tr key={c._id} className="border-t">
                    <td className="p-2 border">{c.caseId}</td>
                    <td className="p-2 border">{c.userType}</td>
                    <td className="p-2 border">{userDisplayName}</td>
                    <td className="p-2 border">{c.topic}</td>
                    <td className="p-2 border">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadgeClass(c.status)}`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="p-2 border">{new Date(c.createdAt).toLocaleString()}</td>
                    <td className="p-2 border">
                      <button 
                        onClick={() => navigate(`/admin/support/${c._id}`)} 
                        className="text-blue-500 hover:text-blue-700 p-1 rounded"
                        title="View Ticket Details"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminSupportScreen;
