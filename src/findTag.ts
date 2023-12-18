import * as github from '@actions/github'

const REFS_PATCH = 'refs/';

export default async function(gitHubToken: string) {
    const octokit = github.getOctokit(gitHubToken)

    const owner = github.context.payload.repository?.owner.login;
    const repo = github.context.payload.repository?.name;
    const ref = github.context.payload.ref.replace(REFS_PATCH, '')

    if(!owner || !repo || !ref) {
        return;
    }

    const refs = await octokit.rest.git.listMatchingRefs({
        owner,
        repo,
        ref
    })

    if (!refs || !refs.data || !refs.data[0]) {
        return;
    }

    const tag = refs.data[0];

    return await octokit.rest.git.getTag({
        owner,
        repo,
        tag_sha: tag.object.sha
    })
}