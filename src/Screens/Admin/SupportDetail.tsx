import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { BASE_URL } from '@/data';
import { useUserStore } from '@/store/userStore';
import { useSupportStore } from '@/store/supportStore';
import { useSellerSession } from '../Seller/sellerSession';

const ALLOWED_HTML_TAGS = new Set([
  'b',
  'br',
  'em',
  'i',
  'li',
  'ol',
  'p',
  'span',
  'strong',
  'u',
  'ul',
]);

const SupportDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = useUserStore((s) => s.user);
  const { seller, memberMode, isOwner } = useSellerSession();
  const { getTicketById, updateTicketStatus, addMessage } = useSupportStore();
  const isAdmin = user?.role === 'Admin';
  const isSeller =
    Boolean(seller) ||
    isOwner ||
    memberMode ||
    user?.role === 'Seller' ||
    user?.role === 'SellerMember' ||
    user?.accountType === 'seller-member';

  const ticket = getTicketById(id || '');

  const [reply, setReply] = useState('');
  const [status, setStatus] = useState(ticket?.status || 'Open');
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);

  useEffect(() => {
    if (ticket) {
      setStatus(ticket.status);
      setSelectedDocument(null);
    }
  }, [ticket]);

  const handleReply = async () => {
    if (!reply.trim() || !ticket) return;
    await addMessage(ticket._id, {
      from: isAdmin ? 'Admin' : isSeller ? 'Seller' : 'User',
      message: reply,
    });
    setReply('');
  };

  const handleStatusChange = async () => {
    if (!ticket) return;
    await updateTicketStatus(ticket._id, status as any);
  };

  const getDocumentUrl = (doc: string) => {
    if (!doc) return '';
    if (/^https?:\/\//i.test(doc)) return doc;
    return `${BASE_URL}${String(doc).replace(/^\/+/, '')}`;
  };

  const getDocumentName = (doc: string, index: number) => {
    const cleanDoc = doc.split('?')[0];
    const fileName = cleanDoc.split('/').pop();
    return fileName || `Document ${index + 1}`;
  };

  const getDocumentType = (doc: string) => {
    const cleanDoc = doc.split('?')[0].toLowerCase();
    if (/\.(png|jpg|jpeg|gif|webp|bmp|svg)$/.test(cleanDoc)) return 'image';
    if (/\.pdf$/.test(cleanDoc)) return 'pdf';
    return 'file';
  };

  const handleBack = () => {
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate('/admin/support');
    }
  };

  const sanitizeHtml = (html: string) => {
    if (typeof window === 'undefined' || !html) return html;

    const parser = new DOMParser();
    const document = parser.parseFromString(html, 'text/html');

    const sanitizeNode = (node: Element) => {
      const tagName = node.tagName.toLowerCase();

      if (!ALLOWED_HTML_TAGS.has(tagName)) {
        const parent = node.parentNode;
        if (!parent) return;
        while (node.firstChild) {
          parent.insertBefore(node.firstChild, node);
        }
        parent.removeChild(node);
        return;
      }

      Array.from(node.attributes).forEach((attribute) => {
        const attributeName = attribute.name.toLowerCase();
        const attributeValue = attribute.value.trim().toLowerCase();
        const isUnsafeLink =
          (attributeName === 'href' || attributeName === 'src') &&
          attributeValue.startsWith('javascript:');

        if (attributeName.startsWith('on') || attributeName === 'style' || isUnsafeLink) {
          node.removeAttribute(attribute.name);
        }
      });

      Array.from(node.children).forEach((child) => sanitizeNode(child));
    };

    Array.from(document.body.children).forEach((child) => sanitizeNode(child));
    return document.body.innerHTML;
  };

  if (!ticket) {
    return <div className="p-6">Ticket not found</div>;
  }

  const userDetails = typeof ticket.user === 'object' ? ticket.user : null;
  const sanitizedMessage = sanitizeHtml(ticket.message);

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h1 className="text-xl font-bold sm:text-2xl">Case {ticket.caseId}</h1>
        <button
          type="button"
          onClick={handleBack}
          className="inline-flex items-center rounded border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:border-gray-400 hover:bg-gray-50"
        >
          Back
        </button>
      </div>
      <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <p><strong>Topic:</strong> {ticket.topic}</p>
          <p>
            <strong>Status:</strong>
            <span
              className={`ml-2 rounded px-2 py-1 text-xs font-medium ${
                ticket.status === 'New' || ticket.status === 'Open'
                  ? 'bg-blue-100 text-blue-800'
                  : ticket.status === 'In Progress'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-green-100 text-green-800'
              }`}
            >
              {ticket.status}
            </span>
          </p>
          <p><strong>Submitted:</strong> {new Date(ticket.createdAt).toLocaleString()}</p>
          <p><strong>Last Updated:</strong> {new Date(ticket.updatedAt).toLocaleString()}</p>
        </div>
        {userDetails && (
          <div className="rounded bg-gray-50 p-4">
            <h3 className="mb-2 font-semibold">User Information</h3>
            <p><strong>Name:</strong> {userDetails.firstName} {userDetails.lastName}</p>
            <p><strong>Email:</strong> {userDetails.email}</p>
            <p><strong>Phone:</strong> {userDetails.phoneNumber}</p>
            {userDetails.instituteName && <p><strong>Institute:</strong> {userDetails.instituteName}</p>}
            <p><strong>User Type:</strong> {ticket.userType}</p>
          </div>
        )}
      </div>

      <div className="mb-4 rounded bg-gray-50 p-4">
        <h3 className="mb-2 font-semibold">Complaint Description</h3>
        <div dangerouslySetInnerHTML={{ __html: sanitizedMessage }} />
      </div>

      {ticket.documents.length > 0 && (
        <div className="mb-4">
          <h3 className="mb-2 font-semibold">Supporting Documents ({ticket.documents.length})</h3>
          <ul className="space-y-2">
            {ticket.documents.map((doc, index) => (
              <li
                key={index}
                className="flex flex-col gap-2 rounded border p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="font-medium break-all">{getDocumentName(doc, index)}</p>
                  <p className="text-xs text-gray-500 break-all">{getDocumentUrl(doc)}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedDocument((current) => (current === doc ? null : doc))}
                    className="rounded bg-blue-500 px-3 py-1 text-sm text-white hover:bg-blue-600"
                  >
                    {selectedDocument === doc ? 'Hide' : 'View'}
                  </button>
                  <a
                    href={getDocumentUrl(doc)}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded border border-blue-500 px-3 py-1 text-sm text-blue-600 hover:bg-blue-50"
                  >
                    Open
                  </a>
                  <a
                    href={getDocumentUrl(doc)}
                    download={getDocumentName(doc, index)}
                    className="rounded border border-gray-300 px-3 py-1 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Download
                  </a>
                </div>
              </li>
            ))}
          </ul>

          {selectedDocument && (
            <div className="mt-4 rounded border bg-white p-4">
              <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <h4 className="font-semibold">Document Preview</h4>
                <a
                  href={getDocumentUrl(selectedDocument)}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-blue-600 underline"
                >
                  Open in new tab
                </a>
              </div>

              {getDocumentType(selectedDocument) === 'image' ? (
                <img
                  src={getDocumentUrl(selectedDocument)}
                  alt="Support document preview"
                  className="max-h-[500px] w-full rounded border object-contain"
                />
              ) : getDocumentType(selectedDocument) === 'pdf' ? (
                <iframe
                  src={getDocumentUrl(selectedDocument)}
                  title="Support document preview"
                  className="h-[600px] w-full rounded border"
                />
              ) : (
                <div className="rounded border border-dashed p-6 text-sm text-gray-600">
                  Is file type ka inline preview available nahi hai. Open ya Download button se document dekh sakte ho.
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <h2 className="mb-4 text-lg font-bold sm:text-xl">Conversation</h2>
      <div className="mb-4">
        {ticket.conversation.map((c, i) => (
          <div key={c._id || i} className="mb-2 rounded border p-2">
            <p><strong>{c.from}:</strong> {c.message}</p>
            <p className="text-sm text-gray-500">
              {c.timestamp ? new Date(c.timestamp).toLocaleString() : c.date}
            </p>
          </div>
        ))}
      </div>

      {isAdmin && (
        <div className="mb-4">
          <label className="mb-2 block font-medium">Update Status</label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full rounded border p-2 sm:w-auto"
            >
              <option>New</option>
              <option>In Progress</option>
              <option>Closed</option>
            </select>
            <button
              onClick={handleStatusChange}
              className="w-full rounded bg-blue-500 px-4 py-2 text-white sm:w-auto"
            >
              Update Status
            </button>
          </div>
        </div>
      )}

      <div className="mb-4">
        <label className="mb-2 block font-medium">Reply</label>
        <textarea
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          placeholder="Type your reply"
          className="w-full rounded border p-2"
          rows={4}
        />
        <button
          onClick={handleReply}
          className="mt-2 w-full rounded bg-blue-500 px-4 py-2 text-white sm:w-auto"
        >
          Send Reply
        </button>
      </div>
    </div>
  );
};

export default SupportDetail;
