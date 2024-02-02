import * as github from '@actions/github'

export default async function(gitHubToken: string, tagName: string, tagMessage: string) {
    const octokit = github.getOctokit(gitHubToken)
    const owner = github.context.payload.repository?.owner.login;
    const repo = github.context.payload.repository?.name;

    if (!owner || !repo || !process.env.GITHUB_SHA) {
        return;
    }

    const createdTag = await octokit.rest.git.createTag({
        owner,
        repo,
        type: 'commit',
        tag: tagName,
        message: tagMessage,
        object: process.env.GITHUB_SHA
    })

    await octokit.rest.git.createRef({
        owner,
        repo,
        ref: 'refs/tags/' + tagName,
        sha: createdTag.data.sha
    })
}