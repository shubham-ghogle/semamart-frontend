import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { CalendarIcon, Eye } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { useSupportStore } from '@/store/supportStore';

const AdminSupportScreen = () => {
  const navigate = useNavigate();
  const { tickets, fetchTickets } = useSupportStore();

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();

  const filteredCases = tickets.filter(c => {
    const userDetails = typeof c.user === 'object' ? c.user : null;
    const userName = userDetails ? `${userDetails.firstName} ${userDetails.lastName}` : '';
    const caseCreatedAt = new Date(c.createdAt);

    // Search filter
    const matchesSearch = c.caseId.toLowerCase().includes(search.toLowerCase()) ||
      userName.toLowerCase().includes(search.toLowerCase()) ||
      c.topic.toLowerCase().includes(search.toLowerCase());

    // Date range filter
    const matchesDateRange = (!startDate || caseCreatedAt >= startDate) &&
      (!endDate || caseCreatedAt <= endDate);

    return matchesSearch && matchesDateRange;
  });

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'New':
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
      <h1 className="text-xl sm:text-2xl font-bold mb-4">Support Management</h1>
      <div className="mb-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <input
          type="text"
          placeholder="Search by Case ID, Name, Topic"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border p-2 rounded w-full sm:flex-1 min-w-[250px]"
        />
        
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "justify-start text-left font-normal w-full sm:w-auto min-w-[200px]",
                !startDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {startDate ? format(startDate, "PPP") : <span>From Date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={startDate}
              onSelect={setStartDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "justify-start text-left font-normal w-full sm:w-auto min-w-[200px]",
                !endDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {endDate ? format(endDate, "PPP") : <span>To Date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={endDate}
              onSelect={setEndDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>
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
              return (
                <tr key={c._id} className="border-t">
                  <td className="p-2 border">{c.caseId}</td>
                  <td className="p-2 border">{c.userType}</td>
                  <td className="p-2 border">{userDetails ? `${userDetails.firstName} ${userDetails.lastName}` : 'N/A'}</td>
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
  );
};

export default AdminSupportScreen;