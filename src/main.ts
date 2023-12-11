import * as core from '@actions/core'
import * as github from '@actions/github'
import getPackage, { IPackageJson } from './getPackage';

interface ICommit {
  message: string,
  distinct: boolean
}

const UPDATE_VERSION_TEXT = 'Update version';

function getHeaderMessageHtml(packageJson: IPackageJson): string {
    return  `<code><strong>${packageJson.name}: ${packageJson.version}</strong></code>`;
}

function getCommitMessageHtml(message: string): string {
    return  `<code> - ${message}</code>`;
}

const isUpdateVersion = (message: string): boolean =>  message.includes(UPDATE_VERSION_TEXT);

const getTransformCommit = (commitMessage: string): string[] => commitMessage.split('\n')
    .filter(message => !(isUpdateVersion(message) || !message));

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

async function main() {
  try {
        const to = core.getInput('to');
        const token = core.getInput('token');
        const commits = github.context.payload.commits.filter((commit: ICommit) => commit.distinct && isUpdateVersion(commit.message));

        if(commits.length < 1) {
            return;
        }

        const packageJson = getPackage();
        const newVersionTag = '#newVersion';
        const divider = '';
        
        const telegramMessageArray = [
            newVersionTag,
            getHeaderMessageHtml(packageJson), 
            divider
        ];

        commits.forEach((commit: ICommit) => {
            const arrayOfChanges = getTransformCommit(commit.message).map(getCommitMessageHtml);
            telegramMessageArray.push(...arrayOfChanges);
        })

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