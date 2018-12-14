# HAL 9001

## Setup
1. Create a `.env` file as follows:
    ```
    DEBUG=hal9001:server
    NODE_END=development
    CLIENT_ID=<YOUR SLACK CLIENT ID>
    CLIENT_SECRET=<YOUR SLACK CLIENT SECRET>
    PORT=3000
    SLACK_PORT=3001
    REFRESH_DB=true
    ```
    Follow [Botkit's Guide](https://botkit.ai/docs/provisioning/slack-events-api.html) for setting a Slack Bot up.
2. Create your [Google Service Account Credientials](https://github.com/theoephraim/node-google-spreadsheet#service-account-recommended-method) and deposit the credentials at the root of this directory as `google-credentials.json`.

## Development
1. Run `npm install` to download the necessary packages.
2. Run `npm run dev` to start (1) the node app; (2) a [localtunnel](https://localtunnel.github.io/www/) that your node app will use to connect with Slack; and (3) the local mongodb.  
3. On first run, you will need to authenticate your app with Slack. Do to this, navigate to `http://0.0.0.0:3001/login` after your app is running and authorize it to connect with your Slack team.