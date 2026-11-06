import { useRef, useState } from 'react'

const MAX_FILE_SIZE = 15 * 1024 * 1024

function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function FileUpload({ category, label = 'Choose a file' }) {
  const [file, setFile] = useState(null)
  const [status, setStatus] = useState('idle')
  const [message, setMessage] = useState('')
  const [unitCode, setUnitCode] = useState('')
  const inputRef = useRef(null)

  async function handleFileChange(event) {
    const selectedFile = event.target.files?.[0]
    if (!selectedFile) return

    setFile(selectedFile)
    setMessage('')

    if (selectedFile.size > MAX_FILE_SIZE) {
      setStatus('error')
      setMessage('Choose a file smaller than 15 MB.')
      event.target.value = ''
      return
    }

    if (!unitCode.trim()) {
      setStatus('error')
      setMessage('Enter the unit code for this material before uploading.')
      event.target.value = ''
      return
    }

    setStatus('uploading')
    const formData = new FormData()
    formData.append('file', selectedFile)
    formData.append('category', category)
    formData.append('unit_code', unitCode.trim().toUpperCase().replace(/\s+/g, ' '))

    try {
      const response = await fetch('/api/upload.php', { method: 'POST', body: formData })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'The file could not be uploaded.')

      setStatus('success')
      setMessage('Uploaded successfully.')
    } catch (error) {
      setStatus('error')
      setMessage(error.message || 'Could not reach the upload server. Check that the PHP API is running.')
    } finally {
      event.target.value = ''
    }
  }

  function clearFile() {
    setFile(null)
    setStatus('idle')
    setMessage('')
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className="file-upload">
      <label className="upload-unit-label">
        Unit code
        <input
          className="upload-unit-input"
          type="text"
          value={unitCode}
          onChange={(event) => setUnitCode(event.target.value)}
          placeholder="e.g. SCS 104"
          maxLength={64}
          required
        />
      </label>
      <input
        ref={inputRef}
        className="file-input"
        type="file"
        accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.jpg,.jpeg,.png"
        onChange={handleFileChange}
        aria-label={label}
      />
      <button
        className="file-pick-button"
        type="button"
        disabled={status === 'uploading'}
        onClick={() => inputRef.current?.click()}
      >
        {status === 'uploading' ? 'Uploading…' : file ? 'Choose another file' : label}
        {status !== 'uploading' && <span aria-hidden="true"> ↑</span>}
      </button>
      {file && (
        <div className="selected-file" role="status">
          <span className="selected-file-icon" aria-hidden="true">{status === 'success' ? '✓' : '↥'}</span>
          <span className="selected-file-details">
            <strong title={file.name}>{file.name}</strong>
            <small>{formatFileSize(file.size)}</small>
          </span>
          <button className="remove-file" type="button" onClick={clearFile} aria-label={`Clear ${file.name}`}>
            ×
          </button>
        </div>
      )}
      {message && <p className={`file-message ${status}`} role={status === 'error' ? 'alert' : 'status'}>{message}</p>}
    </div>
  )
}
