const org = "betterfetch";
const commitsContainer = document.getElementById("commits");

async function fetchAllRepos(page = 1, repos = []) {
  const resp = await fetch(`https://api.github.com/orgs/${org}/repos?per_page=100&page=${page}`);
  const data = await resp.json();
  if (!Array.isArray(data) || data.length === 0) return repos;
  return fetchAllRepos(page + 1, repos.concat(data));
}

async function fetchLatestCommit(repoName) {
  const resp = await fetch(`https://api.github.com/repos/${org}/${repoName}/commits?per_page=1`);
  const data = await resp.json();
  return data[0];
}

async function render() {
  commitsContainer.innerHTML = `<div class="loading">Fetching repositories...</div>`;

  const repos = await fetchAllRepos();
  commitsContainer.innerHTML = ""; // Clear loading text

  for (const repo of repos) {
    const commit = await fetchLatestCommit(repo.name);
    if (!commit) continue;

    const { commit: { message, author: { name, date } }, html_url } = commit;

    const card = document.createElement("div");
    card.className = "repo-card";
    card.innerHTML = `
      <div class="repo-name">${repo.name}</div>
      <a class="commit-message" href="${html_url}" target="_blank">${message}</a>
      <div class="commit-meta">
        by <strong>${name}</strong> on ${new Date(date).toLocaleString()}
      </div>
    `;
    commitsContainer.appendChild(card);
  }
}

render().catch(err => {
  commitsContainer.innerHTML = `<div class="loading">Error: ${err.message}</div>`;
  console.error(err);
});
