"""
One-time OAuth setup for the Google Ads API.

Run this YOURSELF in your own terminal (not via an agent) — it opens your
browser for you to approve access with your Google account. Never paste your
Google password anywhere; the browser consent screen handles that.

Prerequisites (set as environment variables before running, do NOT hardcode
them in this file or commit them anywhere):

    export GOOGLE_ADS_CLIENT_ID="...apps.googleusercontent.com"
    export GOOGLE_ADS_CLIENT_SECRET="GOCSPX-..."
    export GOOGLE_ADS_DEVELOPER_TOKEN="..."

Then:

    pip install -r requirements.txt
    python google_ads_auth_setup.py

Output: writes ~/.google-ads.yaml (OUTSIDE this repo, in your home
directory) containing the developer token, client id/secret, and the
refresh token this flow obtains. That file is what the Google Ads Python
client library reads automatically — never move it into the project repo.
"""

import os
import sys
from pathlib import Path

from google_auth_oauthlib.flow import InstalledAppFlow

SCOPES = ["https://www.googleapis.com/auth/adwords"]


def main():
    client_id = os.environ.get("GOOGLE_ADS_CLIENT_ID")
    client_secret = os.environ.get("GOOGLE_ADS_CLIENT_SECRET")
    developer_token = os.environ.get("GOOGLE_ADS_DEVELOPER_TOKEN")

    missing = [
        name
        for name, val in [
            ("GOOGLE_ADS_CLIENT_ID", client_id),
            ("GOOGLE_ADS_CLIENT_SECRET", client_secret),
            ("GOOGLE_ADS_DEVELOPER_TOKEN", developer_token),
        ]
        if not val
    ]
    if missing:
        print(f"Missing environment variables: {', '.join(missing)}", file=sys.stderr)
        sys.exit(1)

    client_config = {
        "installed": {
            "client_id": client_id,
            "client_secret": client_secret,
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
            "redirect_uris": ["http://localhost"],
        }
    }

    flow = InstalledAppFlow.from_client_config(client_config, scopes=SCOPES)
    # Opens your default browser; you log in and approve as yourself.
    credentials = flow.run_local_server(port=0)

    yaml_path = Path.home() / "google-ads.yaml"  # no leading dot — this is the exact filename the google-ads library's default loader expects in $HOME
    yaml_content = (
        f"developer_token: {developer_token}\n"
        f"client_id: {client_id}\n"
        f"client_secret: {client_secret}\n"
        f"refresh_token: {credentials.refresh_token}\n"
        f"use_proto_plus: true\n"
    )
    yaml_path.write_text(yaml_content)
    yaml_path.chmod(0o600)

    print(f"Wrote credentials to {yaml_path} (permissions set to owner-read/write only).")
    print("You still need a Google Ads customer ID (login-customer-id) — see fetch_keyword_ideas.py.")


if __name__ == "__main__":
    main()
