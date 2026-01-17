import { useState } from 'react';
import '../styles/DocGenerator.css';
import axios from 'axios';

const DocGenerator = () => {
    const [searchItem, setSearchItem] = useState('');
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [filesInRepo, setFilesInRepo] = useState([]);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [docGenerated, setDocGenerated] = useState(false);

    const handleDocGeneratorSubmit = async (event) => {
        event.preventDefault();
        if (!searchItem.trim()) {
            setError('Please enter a GitHub repository URL');
            return;
        }

        setIsLoading(true);
        setError(null);
        setDocGenerated(false);

        try {
            const response = await axios.post('http://127.0.0.1:8000/repoanalyze/get_files_from_repository/', {
                input: searchItem
            });
            setFilesInRepo(response.data.output);
            setSelectedFiles([]);
        } catch (err) {
            console.error('Error fetching files:', err);
            setError('Failed to retrieve files. Please check the repository URL.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileSelection = (e) => {
        const file = e.target.name;
        if (e.target.checked) {
            setSelectedFiles([...selectedFiles, file]);
        } else {
            setSelectedFiles(selectedFiles.filter((f) => f !== file));
        }
    };

    const handleSelectAll = () => {
        if (selectedFiles.length === filesInRepo.length) {
            setSelectedFiles([]);
        } else {
            setSelectedFiles([...filesInRepo]);
        }
    };

    const handleDocGeneration = async (e) => {
        e.preventDefault();
        if (selectedFiles.length === 0) {
            setError('Please select at least one file');
            return;
        }

        setIsGenerating(true);
        setError(null);

        try {
            const response = await axios.post('http://127.0.0.1:8000/repoanalyze/generate_doc_strings/', {
                input: selectedFiles
            });
            if (response.data.output) {
                setDocGenerated(true);
                setFilesInRepo([]);
                setSelectedFiles([]);
            }
        } catch (err) {
            setError('Failed to generate docstrings. Please try again.');
            setDocGenerated(false);
        } finally {
            setIsGenerating(false);
        }
    };

    const getFileName = (path) => {
        return path.split('/').pop();
    };

    return (
        <div className="page-wrapper">
            <div className="page-header">
                <h1>Code Refactor</h1>
                <p>Generate professional docstrings for your Python code automatically</p>
            </div>

            <div className="content-card">
                <form onSubmit={handleDocGeneratorSubmit} className="search-form">
                    <div className="input-wrapper">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="input-icon">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                        </svg>
                        <input
                            type="text"
                            value={searchItem}
                            onChange={(e) => setSearchItem(e.target.value)}
                            placeholder="https://github.com/username/repository"
                            className="input-field"
                        />
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <span className="spinner"></span>
                                Fetching...
                            </>
                        ) : (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" width="20" height="20">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 00-1.883 2.542l.857 6a2.25 2.25 0 002.227 1.932H19.05a2.25 2.25 0 002.227-1.932l.857-6a2.25 2.25 0 00-1.883-2.542m-16.5 0V6A2.25 2.25 0 016 3.75h3.879a1.5 1.5 0 011.06.44l2.122 2.12a1.5 1.5 0 001.06.44H18A2.25 2.25 0 0120.25 9v.776" />
                                </svg>
                                Fetch Files
                            </>
                        )}
                    </button>
                </form>

                {error && <div className="error-message">{error}</div>}

                {filesInRepo.length > 0 && !docGenerated && (
                    <div className="files-section">
                        <div className="files-header">
                            <h3>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="24" height="24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                                </svg>
                                Select Files ({selectedFiles.length}/{filesInRepo.length})
                            </h3>
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={handleSelectAll}
                            >
                                {selectedFiles.length === filesInRepo.length ? 'Deselect All' : 'Select All'}
                            </button>
                        </div>

                        <div className="files-list">
                            {filesInRepo.map((file, index) => (
                                <label key={index} className={`file-item ${selectedFiles.includes(file) ? 'selected' : ''}`}>
                                    <input
                                        type="checkbox"
                                        name={file}
                                        checked={selectedFiles.includes(file)}
                                        onChange={handleFileSelection}
                                    />
                                    <span className="checkbox-custom"></span>
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="18" height="18">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
                                    </svg>
                                    <span className="file-name">{getFileName(file)}</span>
                                </label>
                            ))}
                        </div>

                        <button
                            className="btn btn-primary generate-btn"
                            onClick={handleDocGeneration}
                            disabled={isGenerating || selectedFiles.length === 0}
                        >
                            {isGenerating ? (
                                <>
                                    <span className="spinner"></span>
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" width="20" height="20">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                                    </svg>
                                    Generate Docstrings
                                </>
                            )}
                        </button>
                    </div>
                )}

                {docGenerated && (
                    <div className="success-message">
                        Docstrings generated successfully! Check your repository for a new branch with the updated files.
                    </div>
                )}
            </div>
        </div>
    );
};

export default DocGenerator;
