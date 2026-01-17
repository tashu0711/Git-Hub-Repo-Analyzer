import { useState } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config';
import '../styles/CommitHistory.css';

const CommitHistory = () => {
    const [searchItem, setSearchItem] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [commitHistory, setCommitHistory] = useState([]);
    const [error, setError] = useState(null);

    const handleSearchTextChange = (event) => {
        setSearchItem(event.target.value);
    };

    const parseCommitData = (commitString) => {
        const lines = commitString.trim().split('\n');
        const commit = {};
        lines.forEach(line => {
            if (line.startsWith('SHA:')) commit.sha = line.replace('SHA:', '').trim();
            if (line.startsWith('Message:')) commit.message = line.replace('Message:', '').trim();
            if (line.startsWith('Author:')) commit.author = line.replace('Author:', '').trim();
            if (line.startsWith('Committer:')) commit.committer = line.replace('Committer:', '').trim();
        });
        return commit;
    };

    const handleCommitSearchSubmit = async (event) => {
        event.preventDefault();
        if (!searchItem.trim()) {
            setError('Please enter a GitHub repository URL');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await axios.post(`${API_BASE_URL}/repoanalyze/get_commit_history/`, {
                input: searchItem,
            });

            const data = response.data.output.split('$').filter(item => item.trim());
            const parsedCommits = data.map(parseCommitData).filter(c => c.sha);
            setCommitHistory(parsedCommits);
        } catch (err) {
            console.error('Error fetching commit history:', err);
            setError('Failed to retrieve commit history. Please check the repository URL.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="page-wrapper">
            <div className="page-header">
                <h1>Commit History</h1>
                <p>View complete commit history with detailed information</p>
            </div>

            <div className="content-card">
                <form onSubmit={handleCommitSearchSubmit} className="search-form">
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
                                Fetching...
                            </>
                        ) : (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" width="20" height="20">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Get Commits
                            </>
                        )}
                    </button>
                </form>

                {error && <div className="error-message">{error}</div>}

                {commitHistory.length > 0 && (
                    <div className="commits-section">
                        <div className="commits-header">
                            <h3>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="24" height="24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {commitHistory.length} Commits Found
                            </h3>
                        </div>
                        <div className="commits-list">
                            {commitHistory.map((commit, index) => (
                                <div key={index} className="commit-card">
                                    <div className="commit-header">
                                        <div className="commit-sha">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="16" height="16">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
                                            </svg>
                                            {commit.sha?.substring(0, 7)}
                                        </div>
                                        {commit.author && (
                                            <div className="commit-author">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="16" height="16">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                                                </svg>
                                                {commit.author}
                                            </div>
                                        )}
                                    </div>
                                    <p className="commit-message">{commit.message || 'No message'}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CommitHistory;
