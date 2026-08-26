import { Metadata } from "next";
import { LifeBuoy, Search, Filter, MoreVertical, MessageSquare, CheckCircle, Clock, AlertCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Support Tickets - Admin",
  description: "Manage customer support inquiries and tickets.",
};

const MOCK_TICKETS = [
  {
    id: "TKT-1049",
    subject: "Payment not going through",
    customer: "Sarah Jenkins",
    email: "sarah.j@example.com",
    status: "OPEN",
    priority: "HIGH",
    time: "10 mins ago",
    category: "Billing"
  },
  {
    id: "TKT-1048",
    subject: "How do I upgrade to Premium?",
    customer: "Michael Chang",
    email: "mike.c@example.com",
    status: "IN_PROGRESS",
    priority: "MEDIUM",
    time: "2 hours ago",
    category: "General Inquiry"
  },
  {
    id: "TKT-1047",
    subject: "Bug in the messaging system",
    customer: "Emma Watson",
    email: "emma@designstudio.com",
    status: "RESOLVED",
    priority: "HIGH",
    time: "Yesterday",
    category: "Technical Support"
  },
  {
    id: "TKT-1046",
    subject: "Partner API access request",
    customer: "David Miller",
    email: "david.m@techcorp.io",
    status: "OPEN",
    priority: "LOW",
    time: "Yesterday",
    category: "Partnership Opportunity"
  },
];

export default function AdminSupportDashboard() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <LifeBuoy className="text-teal-600" size={24} />
            Support Dashboard
          </h1>
          <p className="text-slate-500 text-sm mt-1">Manage user inquiries, tickets, and contact messages.</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text"
              placeholder="Search tickets..."
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
            <Filter size={16} />
            Filter
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Total Tickets</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">1,248</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
            <MessageSquare size={20} />
          </div>
        </div>
        
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Open Tickets</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">24</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
            <Clock size={20} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">High Priority</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">5</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-600">
            <AlertCircle size={20} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Resolved Today</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">18</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
            <CheckCircle size={20} />
          </div>
        </div>
      </div>

      {/* Tickets Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="border-b border-slate-200 bg-slate-50/50 px-6 py-4 flex gap-6">
          <button className="text-sm font-semibold text-teal-700 border-b-2 border-teal-600 pb-4 -mb-4">All Tickets</button>
          <button className="text-sm font-medium text-slate-500 hover:text-slate-700 pb-4 -mb-4">Unassigned</button>
          <button className="text-sm font-medium text-slate-500 hover:text-slate-700 pb-4 -mb-4">My Tickets</button>
          <button className="text-sm font-medium text-slate-500 hover:text-slate-700 pb-4 -mb-4">Resolved</button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-sm text-slate-500 bg-white">
                <th className="px-6 py-4 font-medium">Ticket ID</th>
                <th className="px-6 py-4 font-medium">Requester</th>
                <th className="px-6 py-4 font-medium">Subject</th>
                <th className="px-6 py-4 font-medium">Category</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Priority</th>
                <th className="px-6 py-4 font-medium">Time</th>
                <th className="px-6 py-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {MOCK_TICKETS.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-slate-50 transition-colors group cursor-pointer">
                  <td className="px-6 py-4 text-sm font-medium text-slate-900">{ticket.id}</td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-slate-900">{ticket.customer}</div>
                    <div className="text-xs text-slate-500">{ticket.email}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-700 font-medium max-w-[200px] truncate">
                    {ticket.subject}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                      {ticket.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {ticket.status === 'OPEN' && <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">Open</span>}
                    {ticket.status === 'IN_PROGRESS' && <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">In Progress</span>}
                    {ticket.status === 'RESOLVED' && <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">Resolved</span>}
                  </td>
                  <td className="px-6 py-4">
                    {ticket.priority === 'HIGH' && <span className="flex items-center gap-1.5 text-xs font-bold text-red-600"><span className="w-1.5 h-1.5 rounded-full bg-red-600"></span> High</span>}
                    {ticket.priority === 'MEDIUM' && <span className="flex items-center gap-1.5 text-xs font-bold text-amber-600"><span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Med</span>}
                    {ticket.priority === 'LOW' && <span className="flex items-center gap-1.5 text-xs font-bold text-slate-500"><span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span> Low</span>}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">{ticket.time}</td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors">
                      <MoreVertical size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination placeholder */}
        <div className="border-t border-slate-200 px-6 py-4 flex items-center justify-between">
          <p className="text-sm text-slate-500">Showing <span className="font-medium text-slate-900">1</span> to <span className="font-medium text-slate-900">4</span> of <span className="font-medium text-slate-900">24</span> tickets</p>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 disabled:opacity-50" disabled>Previous</button>
            <button className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
