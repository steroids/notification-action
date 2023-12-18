import * as core from '@actions/core'
import getPackage, { IPackageJson } from './getPackage';
import findTag from './findTag';


function getHeaderMessageHtml(packageJson: IPackageJson): string {
    return  `<code><strong>${packageJson.name}: ${packageJson.version}</strong></code>`;
}

function getCommitMessageHtml(message: string): string {
    return  `<code> - ${message}</code>`;
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

async function main() {
  try {
        const to = core.getInput('to');
        const token = core.getInput('token');
        const gitHubToken = core.getInput('git_token');

        const tag = await findTag(gitHubToken);
        const tagMessage = (tag?.data.message ?? '').trim();

        if (!tagMessage) {
            return;
        }

        const packageJson = getPackage();
        
        const telegramMessageArray = [
            '#newVersion',
            getHeaderMessageHtml(packageJson), 
            '',
            ...tagMessage.split(/\-\s/).filter(Boolean).map(getCommitMessageHtml),
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