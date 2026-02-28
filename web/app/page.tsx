'use client'

import { useState, useRef, useCallback } from 'react'

interface UploadResult {
  cid: string
  size: string
  gatewayUrl: string
  qrDataUrl: string
}

export default function Home() {
  const [apiUrl, setApiUrl] = useState('http://localhost:5001')
  const [file, setFile] = useState<File | null>(null)
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<UploadResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped) {
      setFile(dropped)
      setResult(null)
      setError(null)
    }
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = e.target.files?.[0]
    if (picked) {
      setFile(picked)
      setResult(null)
      setError(null)
    }
  }

  const handleUpload = async () => {
    if (!file) return
    setLoading(true)
    setError(null)
    setResult(null)

    const formData = new FormData()
    formData.append('file', file)
    formData.append('apiUrl', apiUrl)

    try {
      const resp = await fetch('/api/upload', { method: 'POST', body: formData })
      const data = await resp.json()
      if (!resp.ok) throw new Error(data.error || 'Upload failed')
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const copyUrl = async () => {
    if (!result) return
    await navigator.clipboard.writeText(result.gatewayUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const formatSize = (bytes: string) => {
    const n = parseInt(bytes)
    if (isNaN(n)) return bytes
    if (n < 1024) return `${n} B`
    if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
    return `${(n / 1024 / 1024).toFixed(1)} MB`
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center py-16 px-4">
      <div className="w-full max-w-xl space-y-6">

        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">IPFS Upload</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Upload files to your IPFS node and get a shareable link
          </p>
        </div>

        {/* IPFS API URL */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            IPFS API URL
          </label>
          <input
            type="text"
            value={apiUrl}
            onChange={e => setApiUrl(e.target.value)}
            placeholder="http://your-node:5001"
            className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-transparent text-sm font-mono focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-600"
          />
        </div>

        {/* Drop zone */}
        <div
          onDrop={handleDrop}
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center cursor-pointer select-none transition-colors ${
            dragging
              ? 'border-zinc-400 dark:border-zinc-500 bg-zinc-50 dark:bg-zinc-900'
              : file
              ? 'border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900'
              : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-900'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileChange}
          />
          <div className="text-3xl mb-3">{file ? '📄' : '📁'}</div>
          {file ? (
            <div className="text-center">
              <p className="font-medium text-sm">{file.name}</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">{formatSize(file.size.toString())}</p>
              <p className="text-xs text-zinc-400 dark:text-zinc-600 mt-2">Click to change file</p>
            </div>
          ) : (
            <div className="text-center">
              <p className="font-medium text-sm">Drop a file here or click to browse</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Any file type supported</p>
            </div>
          )}
        </div>

        {/* Upload button */}
        <button
          onClick={handleUpload}
          disabled={!file || loading}
          className="w-full py-2.5 px-4 bg-foreground text-background rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-35 disabled:cursor-not-allowed transition-opacity"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="inline-block w-3.5 h-3.5 border-2 border-background/30 border-t-background rounded-full animate-spin" />
              Uploading…
            </span>
          ) : 'Upload to IPFS'}
        </button>

        {/* Error */}
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
              <p className="text-sm font-medium text-green-600 dark:text-green-400">✓ Uploaded successfully · {formatSize(result.size)}</p>
            </div>

            <div className="px-5 py-4 space-y-4">
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">CID</p>
                <p className="font-mono text-sm break-all">{result.cid}</p>
              </div>

              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Gateway URL</p>
                <a
                  href={result.gatewayUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-sm break-all text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {result.gatewayUrl}
                </a>
              </div>

              {/* QR code */}
              <div className="flex flex-col items-center pt-2 pb-1">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={result.qrDataUrl} alt="QR Code for gateway URL" className="w-44 h-44" />
                <p className="text-xs text-zinc-400 dark:text-zinc-600 mt-2">Scan to open on mobile</p>
              </div>

              <button
                onClick={copyUrl}
                className="w-full py-2 px-4 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
              >
                {copied ? '✓ Copied!' : 'Copy URL'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
