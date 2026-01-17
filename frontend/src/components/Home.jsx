import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Home.css';

const Home = () => {
    const features = [
        {
            title: 'Dependency Tracker',
            description: 'Analyze and track all dependencies in any GitHub repository. Get a complete list of packages and their versions.',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
                </svg>
            ),
            path: '/components/DependencyTracker',
            color: '#06b6d4'
        },
        {
            title: 'Commit History',
            description: 'View complete commit history with detailed information including authors, messages, and file changes.',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            path: '/components/CommitHistory',
            color: '#8b5cf6'
        },
        {
            title: 'Code Refactor',
            description: 'Generate professional docstrings for your Python code. Improve code documentation automatically.',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
                </svg>
            ),
            path: '/components/DocGenerator',
            color: '#f59e0b'
        },
        {
            title: 'Create Documentation',
            description: 'Generate complete documentation using Sphinx. Download professional docs as a ZIP file.',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
            ),
            path: '/components/CreateDocumention',
            color: '#10b981'
        }
    ];

    return (
        <div className="home">
            {/* Hero Section */}
            <section className="hero">
                <div className="hero-content">
                    <div className="hero-badge">
                        <span className="badge-dot"></span>
                        Open Source Tool
                    </div>
                    <h1 className="hero-title">
                        GitHub Repository
                        <span className="gradient-text"> Analyzer</span>
                    </h1>
                    <p className="hero-description">
                        A powerful tool to analyze GitHub repositories. Track dependencies,
                        view commit history, generate documentation, and refactor code with ease.
                    </p>
                    <div className="hero-actions">
                        <Link to="/components/DependencyTracker" className="btn btn-primary">
                            Get Started
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" width="20" height="20">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                            </svg>
                        </Link>
                        <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z"/>
                            </svg>
                            View on GitHub
                        </a>
                    </div>
                </div>
                <div className="hero-visual">
                    <div className="code-window">
                        <div className="window-header">
                            <div className="window-dots">
                                <span className="dot red"></span>
                                <span className="dot yellow"></span>
                                <span className="dot green"></span>
                            </div>
                            <span className="window-title">analyzer.py</span>
                        </div>
                        <div className="window-content">
                            <pre><code><span className="keyword">from</span> analyzer <span className="keyword">import</span> GitHubRepo{'\n'}{'\n'}<span className="comment"># Initialize analyzer</span>{'\n'}repo = GitHubRepo(<span className="string">"user/repo"</span>){'\n'}{'\n'}<span className="comment"># Get dependencies</span>{'\n'}deps = repo.get_dependencies(){'\n'}{'\n'}<span className="comment"># Generate docs</span>{'\n'}repo.generate_documentation()</code></pre>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="features">
                <div className="section-header">
                    <h2>Powerful Features</h2>
                    <p>Everything you need to analyze and document your GitHub repositories</p>
                </div>
                <div className="features-grid">
                    {features.map((feature, index) => (
                        <Link
                            to={feature.path}
                            key={index}
                            className="feature-card"
                            style={{ '--accent-color': feature.color }}
                        >
                            <div className="feature-icon">
                                {feature.icon}
                            </div>
                            <h3>{feature.title}</h3>
                            <p>{feature.description}</p>
                            <span className="feature-link">
                                Explore
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" width="16" height="16">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75" />
                                </svg>
                            </span>
                        </Link>
                    ))}
                </div>
            </section>

            {/* Footer */}
            <footer className="footer">
                <p>Built with React & Django | GitHub Repo Analyzer</p>
            </footer>
        </div>
    );
};

export default Home;
