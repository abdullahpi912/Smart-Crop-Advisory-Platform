import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '../lib/apiConfig';

const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.pdf'];
const MAX_FILE_SIZE = 8 * 1024 * 1024; // 8MB limit

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export default function DocumentUpload({ modelType = 'crop', showToast, onExtracted }) {
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [progressStatus, setProgressStatus] = useState('');
  const [activeFile, setActiveFile] = useState(null);
  const [user, setUser] = useState(null);
  const fileInputRef = useRef(null);
  const progressTimerRef = useRef(null);

  // Check login state
  useEffect(() => {
    try {
      const stored =
        localStorage.getItem('cropling_user') ||
        localStorage.getItem('agrisense_user') ||
        localStorage.getItem('cropling_session') ||
        localStorage.getItem('agrisense_session');
      if (stored) {
        setUser(JSON.parse(stored));
      } else {
        setUser(null);
      }
    } catch (e) {
      setUser(null);
    }
  }, []);

  // Cleanup progress interval on unmount
  useEffect(() => {
    return () => {
      if (progressTimerRef.current) {
        clearInterval(progressTimerRef.current);
      }
    };
  }, []);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAnalyzing && user) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (!user) {
      showToast?.('Please sign in to use AI document auto-fill', 'warning');
      return;
    }

    if (isAnalyzing) return;

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleFileInputChange = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const processFile = async (file) => {
    if (!file) return;

    const fileName = file.name || '';
    const fileExt = '.' + fileName.split('.').pop().toLowerCase();

    // Client-side validation
    if (!ALLOWED_EXTENSIONS.includes(fileExt)) {
      showToast?.(
        `Unsupported file type '${fileExt}'. Only JPG, PNG, WEBP, and PDF documents are supported.`,
        'error'
      );
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      showToast?.('File size exceeds the 8 MB upload limit.', 'error');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setActiveFile({
      name: fileName,
      size: formatBytes(file.size),
      ext: fileExt.toUpperCase().replace('.', '')
    });
    setIsAnalyzing(true);
    setUploadProgress(15);
    setProgressStatus('Uploading report to secure memory buffer...');

    // Progress simulation stages
    let currentP = 15;
    progressTimerRef.current = setInterval(() => {
      currentP += Math.floor(Math.random() * 8) + 4;
      if (currentP > 90) {
        currentP = 90;
        setProgressStatus('Extracting agricultural telemetry from report...');
      } else if (currentP > 60) {
        setProgressStatus('Analyzing document layout & parameter values...');
      } else if (currentP > 35) {
        setProgressStatus('Scanning document tokens and telemetry data...');
      }
      setUploadProgress(currentP);
    }, 180);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 45000);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('model_type', modelType);

      const response = await fetch(`${API_BASE_URL}/api/analyze-document`, {
        method: 'POST',
        credentials: 'include',
        signal: controller.signal,
        body: formData
      });

      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
      setUploadProgress(100);
      setProgressStatus('Extraction complete! Auto-filling parameters...');

      const data = await response.json().catch(() => ({}));

      // Short delay so the user sees 100% completion
      await new Promise((res) => setTimeout(res, 350));

      if (response.ok && data.status === 'success') {
        const foundCount = data.fields_found ? data.fields_found.length : 0;
        const missingCount = data.fields_missing ? data.fields_missing.length : 0;
        const total = foundCount + missingCount;

        if (foundCount > 0) {
          showToast?.(
            `Auto-filled ${foundCount} of ${total} fields from '${fileName}'. Please review and complete remaining fields.`,
            'success'
          );
        } else {
          showToast?.(
            `No matching ${modelType.toUpperCase()} telemetry found in '${fileName}'. Please fill in fields manually.`,
            'info'
          );
        }

        if (onExtracted) {
          onExtracted(data.extracted || {}, data.fields_found || [], data.fields_missing || []);
        }
      } else {
        if (response.status === 401) {
          showToast?.('Your session has expired. Please sign in again to use AI extraction.', 'warning');
        } else if (response.status === 429) {
          showToast?.(
            'AI document extraction is temporarily busy. Please wait a minute and try again.',
            'warning'
          );
        } else if (response.status === 503) {
          showToast?.('AI document analysis is not configured on this server.', 'info');
        } else if (response.status === 504) {
          showToast?.('This is taking longer than usual — please try again.', 'warning');
        } else {
          showToast?.(data.error || 'Failed to extract values from document. Please verify document clarity.', 'error');
        }
      }
    } catch (err) {
      console.error('Document analysis request error:', err);
      if (err.name === 'AbortError') {
        showToast?.('This is taking longer than usual — please try again.', 'warning');
      } else {
        showToast?.('Reconnecting to the server — this can take up to a minute on first use, please retry shortly.', 'warning');
      }
    } finally {
      clearTimeout(timeoutId);
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
      setIsAnalyzing(false);
      setUploadProgress(0);
      setActiveFile(null);
      setProgressStatus('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const triggerBrowse = () => {
    if (!user) {
      showToast?.('Please sign in to use AI document auto-fill', 'warning');
      return;
    }
    if (!isAnalyzing && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const getModelLabel = () => {
    if (modelType === 'fertilizer') return 'Soil Testing / Fertilizer Lab Report';
    if (modelType === 'yield') return 'Farm Production / Harvest Record';
    return 'Soil Lab Test / Agronomic Report';
  };

  return (
    <div className="doc-upload-container">
      <input
        type="file"
        ref={fileInputRef}
        accept=".jpg,.jpeg,.png,.webp,.pdf"
        onChange={handleFileInputChange}
        style={{ display: 'none' }}
        disabled={!user || isAnalyzing}
      />

      <div
        className={`doc-upload-zone ${isDragging ? 'dragover' : ''} ${isAnalyzing ? 'analyzing' : ''} ${
          !user ? 'disabled' : ''
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={user && !isAnalyzing ? triggerBrowse : undefined}
        role="button"
        tabIndex={user ? 0 : -1}
        onKeyDown={(e) => {
          if (user && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            triggerBrowse();
          }
        }}
        aria-label="Upload soil test report or agricultural document for AI auto-fill"
      >
        {/* Subtle decorative ambient glow element */}
        <div className="doc-upload-ambient-glow" aria-hidden="true"></div>

        {isAnalyzing ? (
          <div className="doc-upload-progress-wrapper">
            <div className="doc-upload-progress-header">
              <div className="doc-upload-progress-file">
                <div className="doc-upload-analyzing-orb">
                  <i className={`fa-solid ${activeFile?.ext === 'PDF' ? 'fa-file-pdf' : 'fa-file-image'}`}></i>
                </div>
                <div className="doc-upload-file-info">
                  <span className="doc-upload-file-name">{activeFile?.name || 'Document'}</span>
                  <span className="doc-upload-file-meta">
                    <span className="doc-format-pill">{activeFile?.ext}</span> &bull; {activeFile?.size}
                  </span>
                </div>
              </div>
              <div className="doc-upload-progress-pct">
                <span className="pct-value">{uploadProgress}%</span>
              </div>
            </div>

            {/* Visual Animated Progress Track */}
            <div className="doc-upload-progress-track">
              <div
                className="doc-upload-progress-fill"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>

            <div className="doc-upload-progress-footer">
              <div className="doc-upload-progress-status">
                <i className="fa-solid fa-circle-notch fa-spin status-spinner"></i>
                <span>{progressStatus || 'Analyzing document...'}</span>
              </div>
              <span className="doc-upload-progress-privacy">
                <i className="fa-solid fa-shield-halved" style={{ marginRight: '4px' }}></i>
                Zero Disk Storage
              </span>
            </div>
          </div>
        ) : !user ? (
          <div className="doc-upload-idle-content">
            <div className="doc-upload-icon-wrapper lock-icon">
              <i className="fa-solid fa-lock"></i>
            </div>
            <div className="doc-upload-text">
              <div className="doc-upload-title-row">
                <span className="doc-upload-title">SMART LAB REPORT AUTO-FILL</span>
              </div>
              <span className="doc-upload-desc">
                Sign in to automatically scan and populate soil telemetry parameters from your {getModelLabel()}.
              </span>
              <div className="doc-upload-meta-row">
                <span className="doc-format-pill">PDF</span>
                <span className="doc-format-pill">JPG</span>
                <span className="doc-format-pill">PNG</span>
                <span className="doc-format-pill">WEBP</span>
                <span className="doc-security-pill">
                  <i className="fa-solid fa-shield-halved"></i>
                  Zero Disk Storage
                </span>
              </div>
            </div>
            <Link
              to="/login"
              className="doc-upload-action-btn"
              onClick={(e) => e.stopPropagation()}
            >
              Sign In to Auto-fill <i className="fa-solid fa-arrow-right" style={{ fontSize: '11px', marginLeft: '6px' }}></i>
            </Link>
          </div>
        ) : (
          <div className="doc-upload-idle-content">
            <div className="doc-upload-icon-wrapper">
              <i className="fa-solid fa-file-lines"></i>
            </div>
            <div className="doc-upload-text">
              <div className="doc-upload-title-row">
                <span className="doc-upload-title">AUTO-FILL FROM LAB REPORT / IMAGE</span>
              </div>
              <span className="doc-upload-desc">
                Drop your <strong>{getModelLabel()}</strong> here or click to browse.
              </span>
              <div className="doc-upload-meta-row">
                <span className="doc-format-pill">PDF</span>
                <span className="doc-format-pill">JPG</span>
                <span className="doc-format-pill">PNG</span>
                <span className="doc-format-pill">WEBP</span>
                <span className="doc-upload-meta-divider">&bull;</span>
                <span className="doc-upload-meta-text">Max 8MB</span>
                <span className="doc-upload-meta-divider">&bull;</span>
                <span className="doc-security-pill">
                  <i className="fa-solid fa-shield-halved"></i>
                  Zero Disk Storage
                </span>
              </div>
            </div>
            <button
              type="button"
              className="doc-upload-action-btn"
              onClick={(e) => {
                e.stopPropagation();
                triggerBrowse();
              }}
            >
              <i className="fa-solid fa-cloud-arrow-up" style={{ fontSize: '13px', marginRight: '7px' }}></i>
              Upload Report
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
