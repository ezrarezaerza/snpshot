import React, { useState, useEffect } from "react";
import { 
  Mail, Inbox, Star, CheckCircle2, Clock, AlertCircle, Search, Filter, 
  Trash2, Plus, MessageSquare, FileText, Download, Send, Copy, ExternalLink, 
  Tag, BarChart3, User, Sparkles, RefreshCw, Edit3, Check, X, Shield, ArrowUpRight
} from "lucide-react";

const CANNED_TEMPLATES = [
  {
    id: "collab",
    title: "Frame & Artist Collab Welcome",
    subject: "Re: Artist Collaboration with SNPSHOT Studio",
    body: "Hi {name},\n\nThank you for reaching out to SNPSHOT Studio! We love your work and creative concept. Our studio team curates seasonal artist frame drops, and we would love to review your artwork overlay dimensions (300 DPI PNG with transparency).\n\nPlease let us know your availability for a quick virtual alignment call this week!\n\nBest regards,\nSNPSHOT Studio Team"
  },
  {
    id: "booking",
    title: "Event Booking Rates & Logistics",
    subject: "Re: SNPSHOT Digital Photo Booth Station Event Booking",
    body: "Hi {name},\n\nThank you for considering SNPSHOT Studio for your event! Our digital self-photo booth station offers live camera capture, custom event-branded frame overlays, real-time filters, and instant QR/email digital delivery.\n\nAttached is our Event Package brochure. To customize your package, please let us know your expected guest count and event duration.\n\nWarmly,\nSNPSHOT Studio Team"
  },
  {
    id: "highres",
    title: "High-Res Export & Technical Support",
    subject: "Re: Photostrip Export Assistance",
    body: "Hi {name},\n\nThank you for bringing this to our attention. Our high-resolution 300 DPI canvas engine handles photo strip exports directly in your browser. We have checked our system logs and refreshed your session download link.\n\nIf you encounter any further issues, please reply directly with your order/session ID so we can assist immediately.\n\nCheers,\nSNPSHOT Studio Tech Support"
  }
];

export default function InquiriesManager() {
  const [activeSubTab, setActiveSubTab] = useState("inbox"); // "inbox" | "inspector" | "analytics"
  const [inquiries, setInquiries] = useState([]);
  const [counts, setCounts] = useState({ total: 0, unread: 0, in_review: 0, resolved: 0, starred: 0 });
  const [subjectCategories, setSubjectCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [selectedInquiry, setSelectedInquiry] = useState(null);

  // New Inquiry Modal
  const [showNewModal, setShowNewModal] = useState(false);
  const [newInquiry, setNewInquiry] = useState({ name: "", email: "", subject: "General Inquiry", message: "" });
  
  // Note Input
  const [newNoteText, setNewNoteText] = useState("");
  const [copiedTemplateId, setCopiedTemplateId] = useState(null);

  // Category Manager
  const [newCategoryText, setNewCategoryText] = useState("");

  const fetchInquiries = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/creator/inquiries");
      const data = await res.json();
      if (data.success) {
        setInquiries(data.inquiries || []);
        setCounts(data.counts || { total: 0, unread: 0, in_review: 0, resolved: 0, starred: 0 });
        setSubjectCategories(data.subjectCategories || []);
        if (data.inquiries && data.inquiries.length > 0 && !selectedInquiry) {
          setSelectedInquiry(data.inquiries[0]);
        } else if (selectedInquiry) {
          const updatedSelected = data.inquiries.find(i => i.id === selectedInquiry.id);
          if (updatedSelected) setSelectedInquiry(updatedSelected);
        }
      }
    } catch (err) {
      console.error("Error fetching inquiries:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  // Update Status
  const handleUpdateStatus = async (inquiryId, newStatus) => {
    try {
      const res = await fetch(`/api/creator/inquiries/${inquiryId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        fetchInquiries();
      }
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  // Delete Inquiry
  const handleDeleteInquiry = async (inquiryId) => {
    if (!window.confirm("Are you sure you want to delete this inquiry record?")) return;
    try {
      const res = await fetch(`/api/creator/inquiries/${inquiryId}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        if (selectedInquiry?.id === inquiryId) setSelectedInquiry(null);
        fetchInquiries();
      }
    } catch (err) {
      console.error("Error deleting inquiry:", err);
    }
  };

  // Add Manual Inquiry
  const handleCreateInquiry = async (e) => {
    e.preventDefault();
    if (!newInquiry.name || !newInquiry.email || !newInquiry.message) return;
    try {
      const res = await fetch("/api/creator/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newInquiry)
      });
      const data = await res.json();
      if (data.success) {
        setShowNewModal(false);
        setNewInquiry({ name: "", email: "", subject: "General Inquiry", message: "" });
        fetchInquiries();
      }
    } catch (err) {
      console.error("Error creating inquiry:", err);
    }
  };

  // Add Staff Note
  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNoteText.trim() || !selectedInquiry) return;
    try {
      const res = await fetch(`/api/creator/inquiries/${selectedInquiry.id}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: newNoteText, author: "Studio Admin" })
      });
      const data = await res.json();
      if (data.success) {
        setNewNoteText("");
        setSelectedInquiry(data.inquiry);
        fetchInquiries();
      }
    } catch (err) {
      console.error("Error adding note:", err);
    }
  };

  // Delete Staff Note
  const handleDeleteNote = async (noteId) => {
    if (!selectedInquiry) return;
    try {
      const res = await fetch(`/api/creator/inquiries/${selectedInquiry.id}/notes/${noteId}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (data.success) {
        setSelectedInquiry(data.inquiry);
        fetchInquiries();
      }
    } catch (err) {
      console.error("Error deleting note:", err);
    }
  };

  // Manage Subject Categories
  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryText.trim()) return;
    const updated = [...subjectCategories, newCategoryText.trim()];
    try {
      const res = await fetch("/api/creator/subject-categories", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categories: updated })
      });
      const data = await res.json();
      if (data.success) {
        setSubjectCategories(data.subjectCategories);
        setNewCategoryText("");
      }
    } catch (err) {
      console.error("Error updating categories:", err);
    }
  };

  const handleDeleteCategory = async (catToDelete) => {
    const updated = subjectCategories.filter(c => c !== catToDelete);
    try {
      const res = await fetch("/api/creator/subject-categories", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categories: updated })
      });
      const data = await res.json();
      if (data.success) {
        setSubjectCategories(data.subjectCategories);
      }
    } catch (err) {
      console.error("Error deleting category:", err);
    }
  };

  // CSV Export
  const handleExportCSV = () => {
    if (inquiries.length === 0) return;
    const headers = ["Inquiry ID", "Name", "Email", "Subject", "Status", "Date", "Message", "Notes Count"];
    const rows = inquiries.map(i => [
      `"${i.id}"`,
      `"${i.name.replace(/"/g, '""')}"`,
      `"${i.email.replace(/"/g, '""')}"`,
      `"${i.subject.replace(/"/g, '""')}"`,
      `"${i.status}"`,
      `"${new Date(i.createdAt).toLocaleString()}"`,
      `"${i.message.replace(/"/g, '""').replace(/\n/g, ' ')}"`,
      `"${(i.notes || []).length}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `snpshot-studio-inquiries-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Copy Canned Response
  const handleCopyTemplate = (tpl) => {
    const textToCopy = tpl.body.replace("{name}", selectedInquiry ? selectedInquiry.name : "Valued Creator");
    navigator.clipboard.writeText(textToCopy);
    setCopiedTemplateId(tpl.id);
    setTimeout(() => setCopiedTemplateId(null), 2000);
  };

  // Mailto Launcher
  const handleOpenMailto = (tpl) => {
    if (!selectedInquiry) return;
    const bodyText = tpl.body.replace("{name}", selectedInquiry.name);
    const subjectText = tpl.subject;
    const mailtoUrl = `mailto:${selectedInquiry.email}?subject=${encodeURIComponent(subjectText)}&body=${encodeURIComponent(bodyText)}`;
    window.open(mailtoUrl, "_blank");
  };

  // Filtered List
  const filteredInquiries = inquiries.filter(i => {
    const matchesSearch = 
      i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.message.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = 
      statusFilter === "all" ? true :
      statusFilter === "starred" ? i.status === "starred" :
      i.status === statusFilter;

    const matchesSubject = subjectFilter === "all" ? true : i.subject === subjectFilter;

    return matchesSearch && matchesStatus && matchesSubject;
  });

  const getBadgeStyle = (status) => {
    switch (status) {
      case "unread":
        return "bg-purple-100 text-[#7226FF] border-purple-200 font-bold";
      case "in_review":
        return "bg-amber-50 text-amber-700 border-amber-200 font-semibold";
      case "starred":
        return "bg-indigo-100 text-indigo-700 border-indigo-200 font-bold";
      case "resolved":
        return "bg-emerald-50 text-emerald-700 border-emerald-200 font-medium";
      default:
        return "bg-slate-100 text-slate-600 border-slate-200";
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER BAR */}
      <div className="bg-white border border-[#e2dced] rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-[#010030] text-white text-[10px] font-mono uppercase tracking-widest px-2.5 py-0.5 rounded-full font-bold">
              MODULE 8 // INBOX & CRM
            </span>
            <span className="text-xs font-mono text-[#7226FF] font-semibold">
              {counts.total} Records ({counts.unread} Unread)
            </span>
          </div>
          <h2 className="text-xl font-black text-[#010030] tracking-tight uppercase flex items-center gap-2">
            <Inbox className="w-5 h-5 text-[#7226FF]" />
            Contact & Studio Inquiry Management
          </h2>
          <p className="text-xs text-[#625b82] mt-0.5">
            Manage incoming event bookings, artist collaborations, user feedback, and technical support inquiries.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={fetchInquiries}
            className="admin-btn p-2.5 border border-[#e2dced] bg-white rounded-xl text-[#010030] hover:bg-[#f0ecf8] transition-colors cursor-pointer"
            title="Refresh Inquiries"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-[#7226FF]" : ""}`} />
          </button>
          <button
            onClick={() => setShowNewModal(true)}
            className="admin-btn px-4 py-2.5 bg-gradient-to-r from-[#160078] via-[#7226FF] to-[#F042FF] hover:opacity-95 text-white font-bold text-xs rounded-xl shadow-[0_4px_12px_rgba(114,38,255,0.3)] transition-all cursor-pointer flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>New Inquiry</span>
          </button>
        </div>
      </div>

      {/* METRIC STRIP */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div 
          onClick={() => { setStatusFilter("all"); setActiveSubTab("inbox"); }}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === "all" ? "bg-[#010030] text-white border-[#010030] shadow-md" : "bg-white border-[#e2dced] hover:border-[#7226FF]"
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-mono uppercase tracking-wider opacity-70">Total Inbox</span>
            <Inbox className="w-4 h-4 text-[#F042FF]" />
          </div>
          <div className="text-2xl font-black tracking-tight">{counts.total}</div>
        </div>

        <div 
          onClick={() => { setStatusFilter("unread"); setActiveSubTab("inbox"); }}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === "unread" ? "bg-[#7226FF] text-white border-[#7226FF] shadow-md" : "bg-white border-[#e2dced] hover:border-[#7226FF]"
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-mono uppercase tracking-wider opacity-70">Unread</span>
            <Mail className="w-4 h-4 text-[#FFE5F1]" />
          </div>
          <div className="text-2xl font-black tracking-tight">{counts.unread}</div>
        </div>

        <div 
          onClick={() => { setStatusFilter("in_review"); setActiveSubTab("inbox"); }}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === "in_review" ? "bg-amber-500 text-white border-amber-500 shadow-md" : "bg-white border-[#e2dced] hover:border-amber-500"
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-mono uppercase tracking-wider opacity-70">In Review</span>
            <Clock className="w-4 h-4 text-amber-200" />
          </div>
          <div className="text-2xl font-black tracking-tight">{counts.in_review}</div>
        </div>

        <div 
          onClick={() => { setStatusFilter("starred"); setActiveSubTab("inbox"); }}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === "starred" ? "bg-indigo-600 text-white border-indigo-600 shadow-md" : "bg-white border-[#e2dced] hover:border-indigo-500"
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-mono uppercase tracking-wider opacity-70">Starred VIP</span>
            <Star className="w-4 h-4 text-amber-300 fill-amber-300" />
          </div>
          <div className="text-2xl font-black tracking-tight">{counts.starred}</div>
        </div>

        <div 
          onClick={() => { setStatusFilter("resolved"); setActiveSubTab("inbox"); }}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === "resolved" ? "bg-emerald-600 text-white border-emerald-600 shadow-md" : "bg-white border-[#e2dced] hover:border-emerald-500"
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-mono uppercase tracking-wider opacity-70">Resolved</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-200" />
          </div>
          <div className="text-2xl font-black tracking-tight">{counts.resolved}</div>
        </div>
      </div>

      {/* NAVIGATION SUB-TABS */}
      <div className="bg-white border border-[#e2dced] rounded-2xl p-2 shadow-xs flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {[
            { id: "inbox", label: "Inquiry Inbox & Workflow", icon: Inbox },
            { id: "inspector", label: "Inquiry Inspector & Response Suite", icon: FileText },
            { id: "analytics", label: "Analytics & CSV Suite", icon: BarChart3 }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id)}
                className={`admin-btn px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                  isActive
                    ? "bg-[#010030] text-white shadow-xs"
                    : "text-[#625b82] hover:bg-[#f0ecf8] hover:text-[#010030]"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-[#F042FF]" : ""}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <button
          onClick={handleExportCSV}
          className="admin-btn px-3.5 py-1.5 bg-[#f0ecf8] hover:bg-[#e2dced] text-[#010030] font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 ml-auto"
        >
          <Download className="w-3.5 h-3.5 text-[#7226FF]" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* SUB-TAB 1: INBOX & WORKFLOW */}
      {activeSubTab === "inbox" && (
        <div className="space-y-4">
          {/* SEARCH & FILTERS BAR */}
          <div className="bg-white border border-[#e2dced] rounded-2xl p-4 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-[#625b82] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search name, email, message..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="admin-ui w-full pl-9 pr-3 py-2 bg-[#f8f6fc] border border-[#e2dced] rounded-xl text-xs text-[#010030] placeholder-[#9a94b8] focus:outline-none focus:border-[#7226FF]"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
              <span className="text-xs font-bold text-[#625b82] flex items-center gap-1 shrink-0">
                <Filter className="w-3.5 h-3.5" /> Category:
              </span>
              <select
                value={subjectFilter}
                onChange={(e) => setSubjectFilter(e.target.value)}
                className="admin-ui py-1.5 px-3 bg-[#f8f6fc] border border-[#e2dced] rounded-xl text-xs font-medium text-[#010030] focus:outline-none focus:border-[#7226FF] cursor-pointer"
              >
                <option value="all">All Subjects</option>
                {subjectCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>

              <span className="text-xs font-bold text-[#625b82] ml-2 shrink-0">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="admin-ui py-1.5 px-3 bg-[#f8f6fc] border border-[#e2dced] rounded-xl text-xs font-medium text-[#010030] focus:outline-none focus:border-[#7226FF] cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="unread">Unread</option>
                <option value="in_review">In Review</option>
                <option value="starred">Starred VIP</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
          </div>

          {/* INQUIRIES LIST TABLE / CARDS */}
          <div className="bg-white border border-[#e2dced] rounded-2xl shadow-xs overflow-hidden">
            {filteredInquiries.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <Mail className="w-10 h-10 text-[#9a94b8] mx-auto" />
                <h4 className="font-bold text-base text-[#010030]">No inquiries found</h4>
                <p className="text-xs text-[#625b82]">Try adjusting your search query or status filters.</p>
              </div>
            ) : (
              <div className="divide-y divide-[#e2dced]">
                {filteredInquiries.map((inquiry) => {
                  const isSelected = selectedInquiry?.id === inquiry.id;
                  return (
                    <div
                      key={inquiry.id}
                      onClick={() => setSelectedInquiry(inquiry)}
                      className={`p-4 transition-all cursor-pointer hover:bg-[#f8f6fc] flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                        isSelected ? "bg-[#f0ecf8] border-l-4 border-l-[#7226FF]" : ""
                      }`}
                    >
                      {/* Left info */}
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUpdateStatus(inquiry.id, inquiry.status === "starred" ? "unread" : "starred");
                          }}
                          className="admin-btn mt-1 text-slate-300 hover:text-amber-400 transition-colors cursor-pointer p-1"
                        >
                          <Star className={`w-4 h-4 ${inquiry.status === "starred" ? "text-amber-400 fill-amber-400" : ""}`} />
                        </button>

                        <div className="space-y-1 flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-sm text-[#010030] truncate">{inquiry.name}</span>
                            <span className="text-xs text-[#625b82] font-mono">&lt;{inquiry.email}&gt;</span>
                            <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border ${getBadgeStyle(inquiry.status)}`}>
                              {inquiry.status.replace("_", " ")}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-[#7226FF] bg-[#7226FF]/10 px-2 py-0.5 rounded-md">
                              {inquiry.subject}
                            </span>
                            <span className="text-[11px] font-mono text-[#625b82]">
                              {new Date(inquiry.createdAt).toLocaleString()}
                            </span>
                            {inquiry.notes && inquiry.notes.length > 0 && (
                              <span className="text-[10px] font-bold text-[#F042FF] bg-[#F042FF]/10 px-1.5 py-0.5 rounded-md flex items-center gap-1">
                                <MessageSquare className="w-3 h-3" /> {inquiry.notes.length}
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-[#4a4365] line-clamp-2 mt-1">
                            {inquiry.message}
                          </p>
                        </div>
                      </div>

                      {/* Right quick actions */}
                      <div className="flex items-center gap-1.5 shrink-0 self-end md:self-center" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedInquiry(inquiry);
                            setActiveSubTab("inspector");
                          }}
                          className="admin-btn px-2.5 py-1.5 bg-[#f0ecf8] hover:bg-[#e2dced] text-[#010030] text-xs font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <span>Inspect</span>
                          <ArrowUpRight className="w-3.5 h-3.5 text-[#7226FF]" />
                        </button>

                        <select
                          value={inquiry.status}
                          onChange={(e) => handleUpdateStatus(inquiry.id, e.target.value)}
                          className="admin-ui py-1 px-2 bg-white border border-[#e2dced] rounded-lg text-xs font-medium text-[#010030] focus:outline-none focus:border-[#7226FF] cursor-pointer"
                        >
                          <option value="unread">Unread</option>
                          <option value="in_review">In Review</option>
                          <option value="starred">Starred</option>
                          <option value="resolved">Resolved</option>
                        </select>

                        <button
                          type="button"
                          onClick={() => handleDeleteInquiry(inquiry.id)}
                          className="admin-btn p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete Inquiry"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB 2: INQUIRY INSPECTOR & RESPONSE SUITE */}
      {activeSubTab === "inspector" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Message Detail View */}
          <div className="lg:col-span-2 space-y-6">
            {selectedInquiry ? (
              <div className="bg-white border border-[#e2dced] rounded-2xl p-6 shadow-xs space-y-6">
                {/* Top sender metadata */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e2dced]">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full border ${getBadgeStyle(selectedInquiry.status)}`}>
                        {selectedInquiry.status.replace("_", " ")}
                      </span>
                      <span className="text-xs font-mono text-[#625b82]">ID: {selectedInquiry.id}</span>
                    </div>
                    <h3 className="text-lg font-black text-[#010030]">{selectedInquiry.name}</h3>
                    <p className="text-xs text-[#7226FF] font-mono font-medium">{selectedInquiry.email}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#010030] bg-[#f0ecf8] px-3 py-1 rounded-xl border border-[#e2dced]">
                      {selectedInquiry.subject}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(selectedInquiry.id, selectedInquiry.status === "starred" ? "unread" : "starred")}
                      className={`admin-btn p-2 rounded-xl border transition-colors cursor-pointer ${
                        selectedInquiry.status === "starred" ? "bg-amber-100 border-amber-300 text-amber-500" : "border-[#e2dced] text-slate-400 hover:text-amber-500"
                      }`}
                    >
                      <Star className={`w-4 h-4 ${selectedInquiry.status === "starred" ? "fill-amber-400" : ""}`} />
                    </button>
                  </div>
                </div>

                {/* Message Body */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#625b82] uppercase tracking-wider">Inquiry Content</span>
                    <span className="text-xs font-mono text-[#9a94b8]">Received: {new Date(selectedInquiry.createdAt).toLocaleString()}</span>
                  </div>
                  <div className="p-4 bg-[#f8f6fc] border border-[#e2dced] rounded-2xl text-xs text-[#010030] leading-relaxed whitespace-pre-wrap font-sans">
                    {selectedInquiry.message}
                  </div>
                </div>

                {/* Staff Notes List */}
                <div className="space-y-3 pt-4 border-t border-[#e2dced]">
                  <h4 className="text-xs font-bold text-[#010030] uppercase tracking-wider flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4 text-[#F042FF]" />
                    Internal Staff Notes ({selectedInquiry.notes ? selectedInquiry.notes.length : 0})
                  </h4>

                  {selectedInquiry.notes && selectedInquiry.notes.length > 0 ? (
                    <div className="space-y-2">
                      {selectedInquiry.notes.map(note => (
                        <div key={note.id} className="p-3 bg-purple-50/60 border border-purple-100 rounded-xl flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold text-[#7226FF] bg-white px-2 py-0.5 rounded-full border border-purple-200">
                                {note.author}
                              </span>
                              <span className="text-[10px] font-mono text-[#625b82]">
                                {new Date(note.createdAt).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-xs text-[#010030]">{note.text}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDeleteNote(note.id)}
                            className="admin-btn text-slate-400 hover:text-red-500 p-1 cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-[#9a94b8] italic">No internal staff notes yet.</p>
                  )}

                  {/* Add Note Form */}
                  <form onSubmit={handleAddNote} className="flex items-center gap-2 pt-2">
                    <input
                      type="text"
                      placeholder="Type internal staff note (e.g. Sent rate sheet, confirmed dates)..."
                      value={newNoteText}
                      onChange={(e) => setNewNoteText(e.target.value)}
                      className="admin-ui flex-1 px-3 py-2 bg-[#f8f6fc] border border-[#e2dced] rounded-xl text-xs text-[#010030] focus:outline-none focus:border-[#7226FF]"
                    />
                    <button
                      type="submit"
                      className="admin-btn px-3.5 py-2 bg-[#010030] hover:bg-[#2e109d] text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer shrink-0"
                    >
                      Add Note
                    </button>
                  </form>
                </div>
              </div>
            ) : (
              <div className="bg-white border border-[#e2dced] rounded-2xl p-12 text-center space-y-3">
                <FileText className="w-10 h-10 text-[#9a94b8] mx-auto" />
                <h4 className="font-bold text-base text-[#010030]">Select an inquiry to inspect</h4>
                <p className="text-xs text-[#625b82]">Choose a message from the Inbox tab to view full details and respond.</p>
              </div>
            )}
          </div>

          {/* Right: Canned Response Templates */}
          <div className="space-y-6">
            <div className="bg-white border border-[#e2dced] rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#F042FF]" />
                <h3 className="font-bold text-sm text-[#010030]">Studio Response Suite</h3>
              </div>
              <p className="text-xs text-[#625b82]">
                Use 1-click canned email templates or trigger direct mailto links to reply to {selectedInquiry?.name || "inquiries"}.
              </p>

              <div className="space-y-3">
                {CANNED_TEMPLATES.map((tpl) => (
                  <div key={tpl.id} className="p-3.5 border border-[#e2dced] hover:border-[#7226FF] rounded-xl bg-[#f8f6fc] space-y-2.5 transition-all">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-[#010030]">{tpl.title}</span>
                      <span className="text-[10px] font-mono text-[#7226FF] bg-[#7226FF]/10 px-1.5 py-0.5 rounded">Template</span>
                    </div>

                    <p className="text-[11px] text-[#625b82] line-clamp-2 italic">
                      "{tpl.body.replace("{name}", selectedInquiry ? selectedInquiry.name : "Creator")}"
                    </p>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => handleCopyTemplate(tpl)}
                        className="admin-btn flex-1 py-1.5 px-2 bg-white hover:bg-[#f0ecf8] border border-[#e2dced] text-[#010030] text-[11px] font-bold rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
                      >
                        {copiedTemplateId === tpl.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-500" />
                            <span className="text-emerald-600">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3 text-[#7226FF]" />
                            <span>Copy Body</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenMailto(tpl)}
                        disabled={!selectedInquiry}
                        className="admin-btn flex-1 py-1.5 px-2 bg-[#7226FF] hover:bg-[#5f1ce0] text-white text-[11px] font-bold rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                      >
                        <Send className="w-3 h-3" />
                        <span>Send Mailto</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: ANALYTICS & CATEGORY SUITE */}
      {activeSubTab === "analytics" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: Category Breakdown */}
            <div className="bg-white border border-[#e2dced] rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-[#7226FF]" />
                  <h3 className="font-bold text-sm text-[#010030]">Topic Distribution Analysis</h3>
                </div>
                <span className="text-xs font-mono text-[#625b82]">{inquiries.length} total</span>
              </div>

              <div className="space-y-3">
                {subjectCategories.map(cat => {
                  const catCount = inquiries.filter(i => i.subject === cat).length;
                  const percentage = inquiries.length > 0 ? Math.round((catCount / inquiries.length) * 100) : 0;
                  return (
                    <div key={cat} className="space-y-1">
                      <div className="flex justify-between text-xs font-medium text-[#010030]">
                        <span>{cat}</span>
                        <span className="font-mono text-[#7226FF] font-bold">{catCount} ({percentage}%)</span>
                      </div>
                      <div className="w-full h-2.5 bg-[#f0ecf8] rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-[#7226FF] to-[#F042FF] rounded-full transition-all duration-500" 
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: Category Options Form Manager */}
            <div className="bg-white border border-[#e2dced] rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-[#F042FF]" />
                <h3 className="font-bold text-sm text-[#010030]">Form Subject Categories Manager</h3>
              </div>
              <p className="text-xs text-[#625b82]">
                Configure dropdown subject options available in public contact form submissions.
              </p>

              <div className="flex flex-wrap gap-2 pt-1">
                {subjectCategories.map(cat => (
                  <span key={cat} className="px-3 py-1.5 bg-[#f8f6fc] border border-[#e2dced] text-[#010030] text-xs font-bold rounded-xl flex items-center gap-1.5">
                    <span>{cat}</span>
                    <button 
                      type="button"
                      onClick={() => handleDeleteCategory(cat)}
                      className="admin-btn text-slate-400 hover:text-red-500 cursor-pointer p-0.5"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>

              <form onSubmit={handleAddCategory} className="flex items-center gap-2 pt-2">
                <input
                  type="text"
                  placeholder="New category (e.g. Franchise Inquiry)..."
                  value={newCategoryText}
                  onChange={(e) => setNewCategoryText(e.target.value)}
                  className="admin-ui flex-1 px-3 py-2 bg-[#f8f6fc] border border-[#e2dced] rounded-xl text-xs text-[#010030] focus:outline-none focus:border-[#7226FF]"
                />
                <button
                  type="submit"
                  className="admin-btn px-4 py-2 bg-[#7226FF] hover:bg-[#5f1ce0] text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer shrink-0"
                >
                  Add
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* NEW INQUIRY MODAL */}
      {showNewModal && (
        <div className="fixed inset-0 bg-[#010030]/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-[#e2dced] rounded-3xl p-6 shadow-2xl max-w-lg w-full space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#e2dced]">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-[#7226FF]" />
                <h3 className="font-bold text-base text-[#010030]">Add Manual Inquiry Record</h3>
              </div>
              <button 
                type="button"
                onClick={() => setShowNewModal(false)}
                className="admin-btn text-slate-400 hover:text-[#010030] p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateInquiry} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#010030] mb-1">Contact Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alexis Jordan"
                  value={newInquiry.name}
                  onChange={(e) => setNewInquiry({ ...newInquiry, name: e.target.value })}
                  className="admin-ui w-full px-3.5 py-2 bg-[#f8f6fc] border border-[#e2dced] rounded-xl text-xs text-[#010030] focus:outline-none focus:border-[#7226FF]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#010030] mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. alexis@studio.co"
                  value={newInquiry.email}
                  onChange={(e) => setNewInquiry({ ...newInquiry, email: e.target.value })}
                  className="admin-ui w-full px-3.5 py-2 bg-[#f8f6fc] border border-[#e2dced] rounded-xl text-xs text-[#010030] focus:outline-none focus:border-[#7226FF]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#010030] mb-1">Subject Category</label>
                <select
                  value={newInquiry.subject}
                  onChange={(e) => setNewInquiry({ ...newInquiry, subject: e.target.value })}
                  className="admin-ui w-full px-3.5 py-2 bg-[#f8f6fc] border border-[#e2dced] rounded-xl text-xs text-[#010030] focus:outline-none focus:border-[#7226FF] cursor-pointer"
                >
                  {subjectCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#010030] mb-1">Message Content *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Type message content..."
                  value={newInquiry.message}
                  onChange={(e) => setNewInquiry({ ...newInquiry, message: e.target.value })}
                  className="admin-ui w-full px-3.5 py-2 bg-[#f8f6fc] border border-[#e2dced] rounded-xl text-xs text-[#010030] focus:outline-none focus:border-[#7226FF]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="admin-btn px-4 py-2 bg-[#f0ecf8] hover:bg-[#e2dced] text-[#010030] font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="admin-btn px-5 py-2 bg-[#7226FF] hover:bg-[#5f1ce0] text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Save Inquiry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
