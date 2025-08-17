/**
 * Recursively fetches the contents of a directory from a GitHub repository.
 * @param owner - The repository owner.
 * @param repo - The repository name.
 * @param path - The path to the directory.
 * @param ref - The branch or commit SHA.
 * @returns A record mapping file paths to their content.
 */
async function fetchRepoDirectory(owner: string, repo: string, path: string, ref: string): Promise<Record<string, string>> {
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${ref}`;
    const response = await fetch(apiUrl, {
        headers: {
            'Accept': 'application/vnd.github.v3+json',
        }
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(`GitHub API Error: ${errorData.message || 'Failed to fetch repository contents.'}`);
    }

    const contents: any[] = await response.json();
    let files: Record<string, string> = {};

    for (const item of contents) {
        if (item.type === 'file' && item.download_url) {
            try {
                const fileResponse = await fetch(item.download_url);
                if (fileResponse.ok) {
                    const content = await fileResponse.text();
                    files[item.path] = content;
                }
            } catch (e) {
                console.warn(`Skipping file ${item.path} due to fetch error:`, e);
            }
        } else if (item.type === 'dir') {
            const subFiles = await fetchRepoDirectory(owner, repo, item.path, ref);
            files = { ...files, ...subFiles };
        }
    }
    return files;
}

/**
 * Fetches code from a public GitHub file or repository folder URL.
 * @param url - The GitHub URL.
 * @returns A record mapping file paths to their content.
 */
export async function fetchCodeFromGitHub(url: string): Promise<Record<string, string>> {
    const blobRegex = /^https?:\/\/github\.com\/([^\/]+)\/([^\/]+)\/blob\/([^\/]+)\/(.+)$/;
    const treeRegex = /^https?:\/\/github\.com\/([^\/]+)\/([^\/]+)\/tree\/([^\/]+)\/?(.*)$/;
    
    const blobMatch = url.match(blobRegex);
    if (blobMatch) {
        const [, owner, repo, branch, path] = blobMatch;
        const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${path}`;
        const response = await fetch(rawUrl);

        if (!response.ok) {
            throw new Error(`Failed to fetch file from GitHub: ${response.status} ${response.statusText}`);
        }
        
        const code = await response.text();
        return { [path]: code };
    }

    const treeMatch = url.match(treeRegex);
    if (treeMatch) {
        const [, owner, repo, branch, path] = treeMatch;
        return fetchRepoDirectory(owner, repo, path || '', branch);
    }

    throw new Error("Invalid GitHub URL. Please provide a URL to a file (.../blob/...) or a folder (.../tree/...).");
}
