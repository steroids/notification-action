import path = require('path');
import * as core from '@actions/core';
import * as fs from 'fs'

export interface ILatestUpdate {
    version: string,
    changed: string[],
}

const changelogFilePath = 'CHANGELOG.md';
const versionReg = /^##\sv([0-9\.]+)\s/;

/**
 * Ищет в файле ./CHANGELOG.md последнюю версию и список изменений к этой версии
 * @returns ILatestUpdate
 */
export default function(): ILatestUpdate {
    const latestUpdate: ILatestUpdate = {
        version: '',
        changed: [],
    };

    const pathChangelog = path.join(core.getInput('path'), changelogFilePath);

    if (!fs.existsSync(pathChangelog)) {
        core.setFailed(changelogFilePath + ' not found');
        return latestUpdate;
    }

    const file = fs.readFileSync(pathChangelog, 'utf-8');
    const lines = file.split('\n');

    /**
     * Проходится по строкам файла в поисках последней версии "## v3.0.6"
     * и собирает все изменения до следующей версии "## v3.0.5"
     * при этом убирает спец символы разметки Markdown
     *      ### Added => Added
     *      ### Fixed => Fixed
     */
    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
        const line: string = lines[lineIndex];
        const versionFound = line.match(versionReg);
    
        if (versionFound && versionFound[1]) {
            if (!latestUpdate.version) {
                latestUpdate.version = versionFound[1];
                continue;
            } else {
                break;
            }
        }
    
        if (latestUpdate.version) {
            latestUpdate.changed.push(line.replace('###', '').trim());
        }
    }

    return latestUpdate;
}