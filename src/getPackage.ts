import * as fs from 'fs'
import * as core from '@actions/core';
import path = require("path");

export interface IPackageJson {
    name: string,
    version: string,
}

export default function(): IPackageJson {
    const pathPackage = path.join(core.getInput('path'), 'package.json');
    const packageProject: IPackageJson = {
        name: '',
        version: '',
    };

    if (fs.existsSync(pathPackage)) {
        return JSON.parse(fs.readFileSync(pathPackage, { encoding: 'utf8', flag: 'r' }));
    }

    return packageProject;
}