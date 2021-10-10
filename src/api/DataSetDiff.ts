/*
* This program and the accompanying materials are made available under the terms of the
* Eclipse Public License v2.0 which accompanies this distribution, and is available at
* https://www.eclipse.org/legal/epl-v20.html
*
* SPDX-License-Identifier: EPL-2.0
*
* Copyright Contributors to the Zowe Project.
*
*/

import { AbstractSession } from "@zowe/imperative";
import {Download, IDownloadOptions, IZosFilesResponse } from "@zowe/cli";
import * as diff from "diff";
import { readFileSync } from "fs";

export class DataSetDiff {
    public static async diff(session: AbstractSession, oldDataSet: string, newDataSet: string) {
        let error;
        let response: IZosFilesResponse;

        const options: IDownloadOptions = {
            extension: "dat",
        }

        try {
            response = await Download.dataSet(session, oldDataSet, options);

        } catch(err){
            error = "oldDataset:" + err;
            throw error;
        }

        try {
            response = await Download.dataSet(session, newDataSet, options);
        }catch(err) {
            error = "newDataset:" + err;
            throw error;
        }

        const regex = /\.|\(/gi; // Replace . and ( with /
        const regex2 = /\)/gi;   // Replace ) with .

        let file = oldDataSet.replace(regex, "/");
        file = file.replace(regex2, ".") + "dat";

        const oldContent = readFileSync(`${file}`).toString();

        file = newDataSet.replace(regex, "/");
        file = file.replace(regex2, ".") + "dat";
        const newContent = readFileSync(`${file}`).toString();

        return diff.createTwoFilesPatch(oldDataSet, newDataSet, oldContent, newContent, "oldDataSet", "newDataSet");

    }
}