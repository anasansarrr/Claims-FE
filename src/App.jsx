import { useState } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle, XCircle, AlertTriangle, Plus, Trash2 } from 'lucide-react';

export default function ClaimProcessor() {
  const [documents, setDocuments] = useState([]);
  const [claimDate, setClaimDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);

  const documentTypes = [
    { value: 'prescription', label: 'Prescription' },
    { value: 'medical_bill', label: 'Medical Bill' },
    { value: 'pharmacy_bill', label: 'Pharmacy Bill' },
    { value: 'lab_results', label: 'Lab Results' },
    { value: 'diagnostic_report', label: 'Diagnostic Report' }
  ];

  const addDocument = () => {
    setDocuments([...documents, { 
      id: Date.now(), 
      type: 'prescription', 
      file: null 
    }]);
  };

  const removeDocument = (id) => {
    setDocuments(documents.filter(doc => doc.id !== id));
  };

  const updateDocumentType = (id, type) => {
    setDocuments(documents.map(doc => 
      doc.id === id ? { ...doc, type } : doc
    ));
  };

  const updateDocumentFile = (id, file) => {
    if (file) {
      setDocuments(documents.map(doc => 
        doc.id === id ? { ...doc, file } : doc
      ));
      setError(null);
    }
  };

  const handleSubmit = async () => {
    const validDocs = documents.filter(doc => doc.file);
    
    if (validDocs.length === 0) {
      setError('Please upload at least one document');
      return;
    }
    
    if (!claimDate) {
      setError('Please select a claim date');
      return;
    }

    setLoading(true);
    setError(null);
    setResponse(null);

    const formData = new FormData();
    
    validDocs.forEach(doc => {
      formData.append(doc.type, doc.file);
    });
    
    formData.append('claim_date', claimDate);

    try {
      const res = await fetch('http://localhost:5000/api/process-claim', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      
      if (data.success) {
        setResponse(data.data);
      } else {
        setError(data.message || 'Failed to process claim');
      }
    } catch (err) {
      setError('Error connecting to server: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const getDecisionColor = (decision) => {
    switch (decision) {
      case 'APPROVED': return 'text-green-600 bg-green-50';
      case 'REJECTED': return 'text-red-600 bg-red-50';
      case 'PARTIAL': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'medium': return 'text-orange-600 bg-orange-50 border-orange-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Insurance Claim Processor</h1>
          <p className="text-gray-600 mb-6">Upload your claim documents and get instant adjudication results</p>

          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="block text-sm font-medium text-gray-700">
                  Claim Documents
                </label>
                <button
                  onClick={addDocument}
                  type="button"
                  className="flex items-center gap-1 px-3 py-1.5 text-sm text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors font-medium"
                >
                  <Plus className="h-4 w-4" />
                  Add Document
                </button>
              </div>
              
              {documents.length === 0 ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                  <FileText className="mx-auto h-16 w-16 text-gray-400 mb-3" />
                  <p className="text-gray-600 mb-1 font-medium">No documents added</p>
                  <p className="text-sm text-gray-500 mb-4">Add at least one document to process your claim</p>
                  <button
                    onClick={addDocument}
                    type="button"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                  >
                    <Plus className="h-4 w-4" />
                    Add First Document
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {documents.map((doc, index) => (
                    <div key={doc.id} className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition-colors bg-white">
                      <div className="flex gap-4">
                        <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-semibold text-sm">
                          {index + 1}
                        </div>
                        
                        <div className="flex-1 space-y-3">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                                Document Type
                              </label>
                              <select
                                value={doc.type}
                                onChange={(e) => updateDocumentType(doc.id, e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm bg-white"
                              >
                                {documentTypes.map(type => (
                                  <option key={type.value} value={type.value}>
                                    {type.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                            
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                                Upload File
                              </label>
                              <div className="relative">
                                <input
                                  type="file"
                                  onChange={(e) => updateDocumentFile(doc.id, e.target.files[0])}
                                  accept=".pdf,.txt,.png,.jpg,.jpeg"
                                  className="hidden"
                                  id={`file-${doc.id}`}
                                />
                                <label
                                  htmlFor={`file-${doc.id}`}
                                  className="flex items-center px-3 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                                >
                                  <Upload className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                                  <span className="text-sm text-gray-600 truncate">
                                    {doc.file ? doc.file.name : 'Choose file...'}
                                  </span>
                                </label>
                              </div>
                            </div>
                          </div>
                          <p className="text-xs text-gray-500">
                            Accepted formats: PDF, TXT, PNG, JPG, JPEG
                          </p>
                        </div>
                        
                        <button
                          onClick={() => removeDocument(doc.id)}
                          type="button"
                          className="flex-shrink-0 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors h-fit"
                          title="Remove document"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Claim Date
              </label>
              <input
                type="date"
                value={claimDate}
                onChange={(e) => setClaimDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
                <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-medium text-base"
            >
              {loading ? 'Processing Claim...' : 'Process Claim'}
            </button>
          </div>
        </div>

        {response && (
          <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Claim Results</h2>
                <p className="text-sm text-gray-600 mt-1">Claim ID: {response.claim_id}</p>
              </div>
              <div className={`px-4 py-2 rounded-lg font-bold text-lg ${getDecisionColor(response.decision)}`}>
                {response.decision}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Total Claimed</p>
                <p className="text-2xl font-bold text-gray-800">₹{response.total_claimed.toLocaleString()}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Approved Amount</p>
                <p className="text-2xl font-bold text-green-600">₹{response.approved_amount.toLocaleString()}</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Confidence Score</p>
                <p className="text-2xl font-bold text-blue-600">{(response.confidence_score * 100).toFixed(0)}%</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-gray-700">Patient Name</p>
                <p className="text-lg text-gray-900">{response.patient_name}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-gray-700">Employee ID</p>
                <p className="text-lg text-gray-900">{response.employee_id}</p>
              </div>
            </div>

            {response.metadata && (
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-indigo-900 mb-3">Documents Processed</h3>
                <div className="space-y-2">
                  <p className="text-sm text-indigo-800">
                    <span className="font-medium">Total:</span> {response.metadata.total_documents} document{response.metadata.total_documents !== 1 ? 's' : ''}
                  </p>
                  {Object.entries(response.metadata.documents_processed || {}).map(([type, info]) => (
                    <div key={type} className="flex items-center text-sm text-indigo-700 pl-3">
                      <CheckCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span className="font-medium capitalize">{type.replace('_', ' ')}:</span>
                      <span className="ml-1 truncate">{info.filename}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {response.critical_issues && response.critical_issues.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                  <XCircle className="h-5 w-5 mr-2 text-red-600" />
                  Critical Issues
                </h3>
                <div className="space-y-2">
                  {response.critical_issues.map((issue, idx) => (
                    <div key={idx} className={`p-3 rounded-lg border ${getSeverityColor(issue.severity)}`}>
                      <p className="font-medium">{issue.code}</p>
                      <p className="text-sm mt-1">{issue.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {response.warnings && response.warnings.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2 text-yellow-600" />
                  Warnings
                </h3>
                <div className="space-y-2">
                  {response.warnings.map((warning, idx) => (
                    <div key={idx} className={`p-3 rounded-lg border ${getSeverityColor(warning.severity)}`}>
                      <p className="font-medium">{warning.code}</p>
                      <p className="text-sm mt-1">{warning.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {response.item_breakdown && response.item_breakdown.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-indigo-600" />
                  Item Breakdown
                </h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Claimed</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Approved</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {response.item_breakdown.map((item, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-900">{item.description}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">₹{item.claimed_amount.toLocaleString()}</td>
                          <td className="px-4 py-3 text-sm font-medium text-green-600">₹{item.approved_amount.toLocaleString()}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              item.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {item.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">{item.reason}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {response.next_steps && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-blue-800 mb-2">Next Steps</h3>
                <p className="text-sm text-blue-700">{response.next_steps}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}