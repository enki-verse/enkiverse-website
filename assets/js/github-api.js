// ENKIVERSE Foundation - GitHub API Integration

let currentToken = null;

// Set authentication token
function setAuthToken(token) {
    currentToken = token;
    // Note: Token is stored in sessionStorage by admin.js, not here
}

// Get stored authentication token
function getAuthToken() {
    return currentToken || sessionStorage.getItem('enkiverse_github_token');
}

// Authenticate with GitHub
async function authenticateGitHub(token) {
    try {
        const response = await fetch('https://api.github.com/user', {
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        if (!response.ok) {
            throw new Error(`Authentication failed: ${response.status}`);
        }

        const user = await response.json();
        setAuthToken(token);

        return {
            success: true,
            user: user
        };
    } catch (error) {
        console.error('GitHub authentication error:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

// Generic GitHub API call with authentication
async function githubApiCall(url, options = {}) {
    const token = getAuthToken();
    if (!token) {
        throw new Error('No authentication token available');
    }

    const defaultHeaders = {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json'
    };

    if (options.body && !(options.body instanceof FormData)) {
        defaultHeaders['Content-Type'] = 'application/json';
    }

    const response = await fetch(`https://api.github.com${url}`, {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers
        }
    });

    if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }

    return response;
}

// Check if file exists in repository
async function fileExists(path) {
    try {
        await githubApiCall(`/repos/${getRepoPath()}/contents/${path}`);
        return true;
    } catch (error) {
        if (error.message.includes('404')) {
            return false;
        }
        throw error;
    }
}

// Get repository configuration
function getRepoPath() {
    // In a real implementation, this would come from config
    return 'enki-verse/enkiverse-website';
}

// Create or update a file in the repository
async function createOrUpdateFile(path, content, message, sha = null) {
    const data = {
        message: message,
        content: btoa(unescape(encodeURIComponent(content))), // Base64 encode with UTF-8 support
        sha: sha // Only needed for updates
    };

    try {
        const method = sha ? 'PUT' : 'PUT'; // Both create and update use PUT
        const response = await githubApiCall(`/repos/${getRepoPath()}/contents/${path}`, {
            method: method,
            body: JSON.stringify(data)
        });

        const result = await response.json();

        return {
            success: true,
            file: result.content,
            commit: result.commit
        };
    } catch (error) {
        console.error('Error creating/updating file:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

// Upload binary file (like images)
async function uploadBinaryFile(path, fileContent, message) {
    try {
        // Convert file content to base64
        const base64Content = await blobToBase64(fileContent);

        const data = {
            message: message,
            content: base64Content
        };

        const response = await githubApiCall(`/repos/${getRepoPath()}/contents/${path}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });

        const result = await response.json();

        return {
            success: true,
            file: result.content,
            commit: result.commit
        };
    } catch (error) {
        console.error('Error uploading binary file:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

// Get file content from repository
async function getFileContent(path) {
    try {
        const response = await githubApiCall(`/repos/${getRepoPath()}/contents/${path}`);
        const data = await response.json();

        // Decode base64 content
        const content = decodeURIComponent(escape(atob(data.content)));

        return {
            success: true,
            content: content,
            sha: data.sha,
            encoding: data.encoding
        };
    } catch (error) {
        console.error('Error getting file content:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

// Create a commit with multiple file changes
async function createCommit(fileChanges, message) {
    // Note: GitHub API doesn't directly support multi-file commits in one call
    // We need to commit files sequentially

    const results = [];

    for (const change of fileChanges) {
        try {
            let result;
            if (change.action === 'update' || change.action === 'create') {
                result = await createOrUpdateFile(
                    change.path,
                    change.content,
                    message,
                    change.sha
                );
            } else if (change.action === 'upload') {
                result = await uploadBinaryFile(
                    change.path,
                    change.content,
                    message
                );
            }

            results.push({
                path: change.path,
                success: result.success,
                commit: result.commit || null
            });

        } catch (error) {
            results.push({
                path: change.path,
                success: false,
                error: error.message
            });
        }
    }

    return results;
}

// Get repository information
async function getRepositoryInfo() {
    try {
        const response = await githubApiCall(`/repos/${getRepoPath()}`);
        const data = await response.json();

        return {
            success: true,
            repo: data
        };
    } catch (error) {
        console.error('Error getting repository info:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

// Validate token permissions
async function validateTokenPermissions() {
    try {
        const response = await githubApiCall('/authorizations');

        // Check if token has repo scope
        const auths = await response.json();
        const hasRepoPerm = auths.some(auth =>
            auth.scopes && auth.scopes.includes('repo')
            || auth.scopes && auth.scopes.includes('public_repo')
        );

        return {
            success: true,
            hasRepoPermission: hasRepoPerm
        };
    } catch (error) {
        console.error('Error validating token permissions:', error);

        // Many tokens won't have access to /authorizations
        // Let's try a simple repo access test instead
        try {
            await githubApiCall(`/repos/${getRepoPath()}`);
            return {
                success: true,
                hasRepoPermission: true // Assume yes since we can access the repo
            };
        } catch (repoError) {
            return {
                success: false,
                error: 'Unable to determine token permissions. Please check your GitHub token.'
            };
        }
    }
}

// Utility functions
function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = reader.result.replace(/^data:[^;]+;base64,/, '');
            resolve(base64String);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

// Generate commit message with timestamp
function generateCommitMessage(action, details = '') {
    const timestamp = new Date().toISOString();
    return `[ENKIVERSE Admin] ${action} - ${timestamp}${details ? ` - ${details}` : ''}`;
}

// Initialize token from session on page load
document.addEventListener('DOMContentLoaded', function() {
    const storedToken = sessionStorage.getItem('enkiverse_github_token');
    if (storedToken) {
        currentToken = storedToken;
    }
});