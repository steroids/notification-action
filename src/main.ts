import * as core from '@actions/core'
import * as github from '@actions/github'
import getPackage, { IPackageJson } from './getPackage';
import getLatestUpdate from './getLatestUpdate';
import createTag from './createTag';

interface ICommit {
    message: string,
    distinct: boolean
}

const UPDATE_VERSION_TEXT = 'Update version';

function getHeaderMessageHtml(packageJson: IPackageJson): string {
    return  `<code><strong>${packageJson.name}: ${packageJson.version}</strong></code>`;
}

function getCommitMessageHtml(message: string): string {
    return  `<code>${message}</code>`;
}

async function sendMessageTelegram(to: string, token: string, message: string) {
    return fetch(`https://api.telegram.org/bot${token}/sendMessage?chat_id=${to}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify({
            parse_mode: 'html',
            text: message
        })
    }).then(data => data.json())
}

function isCommitUpdateVersion(commits: ICommit[]) {
    return commits.filter((commit) => commit.distinct && commit.message.includes(UPDATE_VERSION_TEXT)).length > 0;
}

async function main() {
  try {
        if (!isCommitUpdateVersion(github.context.payload.commits)) {
            return;
        }

        const to = core.getInput('to');
        const token = core.getInput('token');
        const gitHubToken = core.getInput('git_token');
        const latestUpdate = getLatestUpdate();
        const packageJson = getPackage();

        if (!latestUpdate.version) {
            return;
        }

        if (latestUpdate.version !== packageJson.version) {
            core.setFailed('Last version in CHANGELOG not equal version in package.json');
            return;
        }

        await createTag(gitHubToken, 'v' + latestUpdate.version, latestUpdate.changed.join('\n'));
        
        const telegramMessageArray = [
            '#newVersion',
            getHeaderMessageHtml(packageJson), 
            '',
            ...latestUpdate.changed.map(getCommitMessageHtml),
        ];

        sendMessageTelegram(to, token, telegramMessageArray.join('\n'))
        .then((response) => {
            if (!response.ok) {
                core.setFailed(response);
            }
        });

  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message);
  }
}

main();