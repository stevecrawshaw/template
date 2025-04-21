# Evidence Template Project

## Using Codespaces

If you are using this template in Codespaces, click the `Start Evidence` button in the bottom status bar. This will install dependencies and open a preview of your project in your browser - you should get a popup prompting you to open in browser.

Or you can use the following commands to get started:

```bash
npm install
npm run sources
npm run dev -- --host 0.0.0.0
```

See [the CLI docs](https://docs.evidence.dev/cli/) for more command information.

**Note:** Codespaces is much faster on the Desktop app. After the Codespace has booted, select the hamburger menu → Open in VS Code Desktop.

## Get Started from VS Code

The easiest way to get started is using the [VS Code Extension](https://marketplace.visualstudio.com/items?itemName=Evidence.evidence-vscode):



1. Install the extension from the VS Code Marketplace
2. Open the Command Palette (Ctrl/Cmd + Shift + P) and enter `Evidence: New Evidence Project`
3. Click `Start Evidence` in the bottom status bar

## Get Started using the CLI

```bash
npx degit evidence-dev/template my-project
cd my-project 
npm install 
npm run sources
npm run dev 
```

Check out the docs for [alternative install methods](https://docs.evidence.dev/getting-started/install-evidence) including Docker, Github Codespaces, and alongside dbt.

## Learning More

- [Docs](https://docs.evidence.dev/)
- [Github](https://github.com/evidence-dev/evidence)
- [Slack Community](https://slack.evidence.dev/)
- [Evidence Home Page](https://www.evidence.dev)

## Notes on this dashboard

This is a demo of evidence.dev for WECA.
The corporate logo is added as a static file in the static folder.
Data for the map are sourced dynamically from the ONS open geography portal as geojson but could also be stored locally in the /static folder

The javascript source was amended with support from Gemini LLM to be able to ingest data from the open data portal's JSON API. This script is in the sources/ods folder. No visualisation is implemented in this dashboard using this data yet.

The layout was amended to include the corporate logo and the frontmatter yaml dispenses with the evidence.dev sidebar and header.

For the sparklines table the data are pivoted using duckdb syntax. The dashboards seem able to ingest data from views as well as tables.

Color palettes can be set in evidence.config.yaml and work well in charts.
The html elements support tailwind CSS classes. The default is to use the evidence.dev theme, but this can be overridden in the config file.