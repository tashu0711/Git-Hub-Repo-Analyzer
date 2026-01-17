import { useState } from 'react';
import axios from 'axios';
import '../styles/DependencyTracker.css';

const DependencyTracker = () => {
    const [searchItem, setSearchItem] = useState('');
    const [dependencyOutput, setDependencyOutput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSearchTextChange = (event) => {
        setSearchItem(event.target.value);
    };

    const handleDependencySubmit = async (event) => {
        event.preventDefault();
        if (!searchItem.trim()) {
            setError('Please enter a GitHub repository URL');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await axios.post("http://127.0.0.1:8000/repoanalyze/get_dependencies/", {
                input: searchItem,
            });
            setDependencyOutput(response.data.output);
        } catch (err) {
            setError('Failed to fetch dependencies. Please check the repository URL.');
            console.error('Error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="page-wrapper">
            <div className="page-header">
                <h1>Dependency Tracker</h1>
                <p>Analyze and track all dependencies in any GitHub repository</p>
            </div>

            <div className="content-card">
                <form onSubmit={handleDependencySubmit} className="search-form">
                    <div className="input-wrapper">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="input-icon">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                        </svg>
                        <input
                            type="text"
                            value={searchItem}
                            onChange={handleSearchTextChange}
                            placeholder="https://github.com/username/repository"
                            className="input-field"
                        />
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <span className="spinner"></span>
                                Analyzing...
                            </>
                        ) : (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" width="20" height="20">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                                </svg>
                                Analyze
                            </>
                        )}
                    </button>
                </form>

                {error && <div className="error-message">{error}</div>}

                {dependencyOutput && (
                    <div className="output-section">
                        <div className="output-header">
                            <h3>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="24" height="24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
                                </svg>
                                Dependencies Found
                            </h3>
                            <button
                                className="btn btn-secondary copy-btn"
                                onClick={() => navigator.clipboard.writeText(dependencyOutput)}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="18" height="18">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                                </svg>
                                Copy
                            </button>
                        </div>
                        <textarea
                            value={dependencyOutput}
                            readOnly
                            className="textarea-field"
                            placeholder="Dependencies will appear here..."
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default DependencyTracker;
