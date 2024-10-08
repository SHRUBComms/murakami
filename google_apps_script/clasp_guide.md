# Using the Command Line Interface with Clasp
Source: https://developers.google.com/apps-script/guides/clasp

## Setup
- Requires `Node.js` version 4.7.4 or later installed
1. Run `npm install @google/clasp -g`
2. Run `clasp login`

## Clone an existing apps script
- The script must be created or shared with your Google account
1. Open Apps Script project
2. At the left, click Project Settings
3. Under IDs, copy the Script ID
4. Run `clasp clone [Script ID]`, e.g. `clasp clone 1Y4-aw9drb934-OZP-2XnebJ0-NNj`

## Contribute to a cloned apps script
1. Create a `.clasp.json` file in the same directory as the `Code.js` you wish to contribute to, for example:
``` json
{
    "scriptId": "1Y4-aw9drb934-OZP-2XnebJ0-NNj",
    "rootDir": "C:\\...\\murakami\\google_apps_script\\carbon_accounting_report"
}
```

## Deployment
1. Run `clasp push`
2. Run `clasp version "Description for the new version"`
3. Run `clasp deploy --versionNumber [version]`, e.g. `clasp deploy --versionNumber 9`
- Run `clasp versions` to see version history
- Run `clasp open` to open the script