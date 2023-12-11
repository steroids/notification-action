import * as fs from 'fs'
import * as core from '@actions/core';
import path = require("path");

export interface PackageJson {
    name: string,
    version: string,
}

export default function(): PackageJson {
    const pathPackage = path.join(core.getInput('path'), 'package.json');
    const packageProject: PackageJson = {
        name: '',
        version: '',
    };

    if (fs.existsSync(pathPackage)) {
        return JSON.parse(fs.readFileSync(pathPackage, { encoding: 'utf8', flag: 'r' }));
    }

    return packageProject;
}