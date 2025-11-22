"use client";

import { useState } from "react";
import axios from "axios";

type InputMode = "file" | "text";
type Format = {
    value: string;
    label: string;
    extension: string;
};

const INPUT_FORMATS: Format[] = [
    { value: "latex", label: "LaTeX", extension: ".tex" },
    { value: "markdown", label: "Markdown", extension: ".md" },
    { value: "html", label: "HTML", extension: ".html" },
    { value: "rst", label: "reStructuredText", extension: ".rst" },
    { value: "org", label: "Org Mode", extension: ".org" },
    { value: "docbook", label: "DocBook", extension: ".xml" },
    { value: "epub", label: "EPUB", extension: ".epub" },
];

const OUTPUT_FORMATS: Format[] = [
    { value: "docx", label: "DOCX", extension: ".docx" },
    { value: "pdf", label: "PDF", extension: ".pdf" },
    { value: "html", label: "HTML", extension: ".html" },
    { value: "latex", label: "LaTeX", extension: ".tex" },
    { value: "markdown", label: "Markdown", extension: ".md" },
    { value: "epub", label: "EPUB", extension: ".epub" },
    { value: "plain", label: "Plain Text", extension: ".txt" },
    { value: "rst", label: "reStructuredText", extension: ".rst" },
    { value: "org", label: "Org Mode", extension: ".org" },
];

export default function Home() {
    const [file, setFile] = useState<File | null>(null);
    const [text, setText] = useState("");
    const [inputMode, setInputMode] = useState<InputMode>("file");
    const [fromFormat, setFromFormat] = useState("latex");
    const [toFormat, setToFormat] = useState("docx");
    const [converting, setConverting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const resetMessages = () => {
        setError("");
        setSuccess(false);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            setFile(e.target.files[0]);
            resetMessages();
        }
    };

    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setText(e.target.value);
        resetMessages();
    };

    const handleModeChange = (mode: InputMode) => {
        setInputMode(mode);
        resetMessages();
    };

    const createFormData = (): FormData => {
        const formData = new FormData();
        const selectedFormat = INPUT_FORMATS.find(f => f.value === fromFormat);

        if (inputMode === "file" && file) {
            formData.append("file", file);
        } else if (inputMode === "text" && selectedFormat) {
            const blob = new Blob([text], { type: "text/plain" });
            const textFile = new File([blob], `document${selectedFormat.extension}`, { type: "text/plain" });
            formData.append("file", textFile);
        }

        formData.append("from_format", fromFormat);
        formData.append("to_format", toFormat);

        return formData;
    };

    const downloadFile = (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        
        const outputFormat = OUTPUT_FORMATS.find(f => f.value === toFormat);
        const filename = inputMode === "file" && file
            ? file.name.replace(/\.[^/.]+$/, outputFormat?.extension || ".txt")
            : `document${outputFormat?.extension || ".txt"}`;
        
        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
    };

    const handleConvert = async () => {
        if (inputMode === "file" && !file) {
            setError("Please select a file");
            return;
        }

        if (inputMode === "text" && !text.trim()) {
            setError("Please enter content");
            return;
        }

        setConverting(true);
        resetMessages();

        try {
            const response = await axios.post(
                "http://localhost:6464/api/convert",
                createFormData(),
                {
                    responseType: "blob",
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            downloadFile(response.data);
            setSuccess(true);
        } catch (err: any) {
            setError(err.response?.data?.detail || "Conversion failed");
        } finally {
            setConverting(false);
        }
    };

    const isDisabled = (inputMode === "file" && !file) || (inputMode === "text" && !text.trim()) || converting;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent"></div>
            
            <div className="relative max-w-6xl mx-auto px-6 py-16">
                <div className="text-center mb-16">
                    <div className="inline-block mb-4">
                        <div className="px-4 py-1.5 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-full">
                            <span className="text-sm font-medium bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                                Powered by Pandoc
                            </span>
                        </div>
                    </div>
                    <h1 className="text-5xl font-bold bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent mb-4">
                        Document Converter
                    </h1>
                    <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                        Transform your documents between multiple formats with ease and precision
                    </p>
                </div>

                <div className="bg-gradient-to-br from-slate-900/50 to-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
                    <div className="grid grid-cols-2 gap-6 mb-8">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-3">
                                Source Format
                            </label>
                            <select
                                value={fromFormat}
                                onChange={(e) => setFromFormat(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                            >
                                {INPUT_FORMATS.map((format) => (
                                    <option key={format.value} value={format.value}>
                                        {format.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-3">
                                Target Format
                            </label>
                            <select
                                value={toFormat}
                                onChange={(e) => setToFormat(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                            >
                                {OUTPUT_FORMATS.map((format) => (
                                    <option key={format.value} value={format.value}>
                                        {format.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="mb-6">
                        <div className="flex gap-2 mb-6 p-1 bg-slate-800/50 rounded-xl border border-slate-700/50">
                            <button
                                onClick={() => handleModeChange("file")}
                                className={`flex-1 px-4 py-2.5 text-sm font-medium rounded-lg transition-all ${
                                    inputMode === "file"
                                        ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/25"
                                        : "text-slate-400 hover:text-slate-200"
                                }`}
                            >
                                Upload File
                            </button>
                            <button
                                onClick={() => handleModeChange("text")}
                                className={`flex-1 px-4 py-2.5 text-sm font-medium rounded-lg transition-all ${
                                    inputMode === "text"
                                        ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/25"
                                        : "text-slate-400 hover:text-slate-200"
                                }`}
                            >
                                Paste Text
                            </button>
                        </div>

                        {inputMode === "file" && (
                            <div>
                                <div className="flex items-center justify-center w-full">
                                    <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-slate-700/50 rounded-xl cursor-pointer hover:border-purple-500/50 hover:bg-slate-800/30 transition-all group">
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <div className="w-16 h-16 mb-4 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                <svg
                                                    className="w-8 h-8 text-purple-400"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                                                    />
                                                </svg>
                                            </div>
                                            <p className="mb-2 text-sm text-slate-300">
                                                <span className="font-semibold">Click to upload</span> or drag and drop
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                {INPUT_FORMATS.find(f => f.value === fromFormat)?.label} files
                                            </p>
                                        </div>
                                        <input
                                            type="file"
                                            className="hidden"
                                            onChange={handleFileChange}
                                        />
                                    </label>
                                </div>
                                {file && (
                                    <div className="mt-4 px-4 py-3 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-xl border border-purple-500/20">
                                        <p className="text-sm text-slate-200">
                                            <span className="font-medium">{file.name}</span>
                                            <span className="text-slate-400 ml-2">
                                                ({(file.size / 1024).toFixed(1)} KB)
                                            </span>
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {inputMode === "text" && (
                            <div>
                                <textarea
                                    value={text}
                                    onChange={handleTextChange}
                                    placeholder={`Paste your ${INPUT_FORMATS.find(f => f.value === fromFormat)?.label} content here...`}
                                    className="w-full h-64 px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all font-mono text-sm resize-y"
                                    spellCheck={false}
                                />
                                {text && (
                                    <div className="mt-4 px-4 py-3 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-xl border border-purple-500/20">
                                        <p className="text-sm text-slate-400">
                                            {text.length} characters
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <button
                        onClick={handleConvert}
                        disabled={isDisabled}
                        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white py-3.5 px-6 rounded-xl text-sm font-semibold disabled:from-slate-700 disabled:to-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed transition-all shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-[1.02] active:scale-[0.98]"
                    >
                        {converting ? (
                            <span className="flex items-center justify-center">
                                <svg
                                    className="animate-spin -ml-1 mr-3 h-5 w-5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    />
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    />
                                </svg>
                                Converting...
                            </span>
                        ) : (
                            "Convert Document"
                        )}
                    </button>

                    {error && (
                        <div className="mt-4 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl backdrop-blur-sm">
                            <p className="text-sm text-red-400">{error}</p>
                        </div>
                    )}
                    {success && (
                        <div className="mt-4 px-4 py-3 bg-green-500/10 border border-green-500/20 rounded-xl backdrop-blur-sm">
                            <p className="text-sm text-green-400">
                                Conversion successful! File downloaded.
                            </p>
                        </div>
                    )}
                </div>

                <div className="mt-12 grid grid-cols-2 gap-6">
                    <div className="bg-gradient-to-br from-slate-900/50 to-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6">
                        <h2 className="text-sm font-semibold text-slate-200 mb-4 flex items-center">
                            <div className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 mr-2"></div>
                            Input Formats
                        </h2>
                        <div className="grid grid-cols-2 gap-2">
                            {INPUT_FORMATS.map((format) => (
                                <div
                                    key={format.value}
                                    className="px-3 py-2 bg-slate-800/50 rounded-lg text-xs text-slate-400 border border-slate-700/30"
                                >
                                    {format.label}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-slate-900/50 to-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6">
                        <h2 className="text-sm font-semibold text-slate-200 mb-4 flex items-center">
                            <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 mr-2"></div>
                            Output Formats
                        </h2>
                        <div className="grid grid-cols-2 gap-2">
                            {OUTPUT_FORMATS.map((format) => (
                                <div
                                    key={format.value}
                                    className="px-3 py-2 bg-slate-800/50 rounded-lg text-xs text-slate-400 border border-slate-700/30"
                                >
                                    {format.label}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
