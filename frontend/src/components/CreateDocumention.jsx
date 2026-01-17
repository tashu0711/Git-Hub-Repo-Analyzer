import { useState } from 'react';
import axios from 'axios';
import '../styles/CreateDocumention.css';

const DocumentationGen = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [docsReady, setDocsReady] = useState(false);
    const [docsUrl, setDocsUrl] = useState('');
    const [filesCount, setFilesCount] = useState(0);

    const handleDocGeneration = async (event) => {
        event.preventDefault();
        if (!searchTerm.trim()) {
            setError('Please enter a GitHub repository URL');
            return;
        }

        setIsLoading(true);
        setError(null);
        setDocsReady(false);

        try {
            const response = await axios.post('http://127.0.0.1:8000/repoanalyze/genDocument_from_docstr/', {
                input: searchTerm
            });
            if (response.status === 200) {
                setDocsReady(true);
                setDocsUrl(response.data.docs_url || 'http://127.0.0.1:8000/repoanalyze/docs/');
                setFilesCount(response.data.files_documented || 0);
            }
        } catch (err) {
            setError('Failed to generate documentation. Please check the repository URL.');
        } finally {
            setIsLoading(false);
        }
    };

    const viewDocumentation = () => {
        if (docsUrl) {
            window.open(docsUrl, '_blank');
        }
    };

    return (
        <div className="page-wrapper">
            <div className="page-header">
                <h1>Create Documentation</h1>
                <p>Generate complete Sphinx documentation for any Python repository</p>
            </div>

            <div className="content-card">
                <form onSubmit={handleDocGeneration} className="search-form">
                    <div className="input-wrapper">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="input-icon">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                        </svg>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="https://github.com/username/repository"
                            className="input-field"
                        />
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <span className="spinner"></span>
                                Generating...
                            </>
                        ) : (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" width="20" height="20">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                                </svg>
                                Generate Docs
                            </>
                        )}
                    </button>
                </form>

                {error && <div className="error-message">{error}</div>}

                {docsReady && (
                    <div className="success-section">
                        <div className="success-card">
                            <div className="success-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className="success-info">
                                <h3>Documentation Ready!</h3>
                                <p>{filesCount} Python files documented successfully.</p>
                            </div>
                            <button
                                className="btn btn-primary view-btn"
                                onClick={viewDocumentation}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" width="20" height="20">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                                </svg>
                                View Documentation
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DocumentationGen;
