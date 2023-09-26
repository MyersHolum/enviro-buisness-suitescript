# MHI SuiteScript Starter Repository
This repository will be your starting point for any SuiteScript project. You MUST clone this repository first before starting ANY SuiteScript development. 

## Contents
* VS Code RESTlet
* .eslintrc
* .prettierrc
* .gitignore
* Client-Scripts
    * .eslintrc
*  Myers-Holum Folder
    * Utility Library File

## SuiteScript 2.1

SuiteScript 2.1 is now mandatory for all new projects. To make your script 2.1, change the JSDoc tag to 2.1:
```
/**
 * @NApiVersion 2.1
 * @NScriptType plugintypeimpl
 */
 ```
 For additional documentation, please review [SuiteAnswers](https://netsuite.custhelp.com/app/answers/detail/a_id/86967)

 **NOTE:** Client scripts are not 2.1 compatible as of yet. All  client scripts should go into the `Client-Scripts` folder. This folder uses our older `.eslint` file, which uses es5 syntax.

# Username / Password Combination DEPRECIATED
While this method might be working on some legacy systems, it is prefrerred to use Token Authorization going forward. 

## VS Code Deployment
Install the [NS Extension](https://marketplace.visualstudio.com/items?itemName=nsupload-org.netsuite-upload) for use with SuiteScript repos
1. Create folder named `.vscode` in your root directory
2. Add `.vscode` to your `.gitignore` file
3. Create `settings.json` file in `.vscode` folder
4. In `settings.json` add the following, separate credentials for different enviornments:

```
   {
    // Script Deployment URL for the deployed vscodeExtensionRestlet.js
    "netSuiteUpload.restlet": "https://12345-sb1.restlets.api.netsuite.com/app/site/hosting/restlet.nl?script=123&deploy=1",
  
    // If using OAuth, set all of these.
    // Oauth NetSuite Key or Token ID
    "netSuiteUpload.netSuiteKey": "fromaccesstoken",
    // Oauth NetSuite Secret
    "netSuiteUpload.netSuiteSecret": "fromaccesstoken",
    // Oauth NetSuite Consumer Key
    "netSuiteUpload.consumerToken": "fromapplicationrecord",
    // Oauth NetSuite Consumer Secret
    "netSuiteUpload.consumerSecret": "fromapplicationrecord",
    // Account number
    "netSuiteUpload.realm": "12345_SB1"
  }
```

## Create "MHI VSCode Extension" Role
1. Create new role named "MHI VSCode Extension"
2. Set permissions in Permissions subtab:
    * Lists > Documents and Files (Level: Full)
    * Setup > Allow JS/HTML uploads (Level: Full)
    * Setup > Log in using Access Tokens (Level: Full)
    * Setup > SuiteScript (Level: Full)
3. Assign this role to your Employee Record
4. Use the internalid of this role in your `settings.json` for the `nlauth_role` value
5. Update repository README with role internal ID

## Generate Integration Record
1. Setup -> Integration -> Manage Integrations -> New
2. Enter Name `MHI VSCODE Integration`
3. Uncheck
    * TBA: AUTHORIZATION FLOW
    * AUTHORIZATION CODE GRANT
4. Save
5. Copy Client Credentials to `settings.json`


## Create Auth Token
1. Setup -> User/Roles -> Access Tokens -> New
2. Select `MHI VSCODE Integration` as Application Name
3. Select User
    * Need to have assigned the "MHI VSCode Extension" role before
4. Select "MHI VSCode Extension" as Role
5. Name Token "MHI VS Code Token"
6. Copy Token Credentials to `settings.json`

## Update JSON in settings.json
1. Update fields
    * TOKEN ID -> netSuiteUpload.netSuiteKey
    * TOKEN SECRET -> netSuiteUpload.netSuiteSecret
    * CONSUMER KEY / CLIENT ID -> netSuiteUpload.consumerToken
    * CONSUMER SECRET / CLIENT SECRET -> netSuiteUpload.consumerSecret
    * NETSUITE ACCOUNT ID -> netSuiteUpload.realm
        - if sandbox account, replace "sb-" with "SB_"
    * RESTLET URL -> netSuiteUpload.restlet


## Sharing Tokens
1. Add Integration Record Tokens Here:
    * CONSUMER KEY / CLIENT ID
        - XXX
    * CONSUMER SECRET / CLIENT SECRET
        - XXX


## Plugin Implementation
This repository contains a Utility Library Plugin script which can be used to speed up development. It is entirely optional to use. Implementation steps below:
1. Create Custom Plugin Type in NetSuite (Customization > Plug-ins > Custom Plug-in Types > New)
2. Select Deployment Model. For most use cases, we should be using "Allow Multiple".
3. Set Status to Released
4. Add Functions to the Methods sublist
5. To reference plugin on a Script record, select the plugin under Custom Plug-In Types in Scripts tab
6. To use in your script, add `'N/plugin'` module to define statement, then load the implementation:

    `const MHI = plugin.loadImplementation({type: 'customscript_mhi_fn_vp_plugin',implementation: 'default'});`
