"""
Pull real CPC/volume data from the Google Ads API (Keyword Planner) and
write it to data/keyword-research/ in the format expected by that
directory's README.

Prerequisite: run google_ads_auth_setup.py first (writes ~/.google-ads.yaml).
You also need a Google Ads CUSTOMER_ID (10-digit, no dashes) — any account
works, including a $0-spend one, since this only calls the free keyword
ideas endpoint.

Usage:
    python fetch_keyword_ideas.py <customer_id> <niche-slug> <keyword1> <keyword2> ...

Example:
    python fetch_keyword_ideas.py 1234567890 self-employment-tax \\
        "1099 vs w2 calculator" "self employment tax calculator" "quarterly estimated tax calculator"
"""

import csv
import sys
from datetime import date
from pathlib import Path

from google.ads.googleads.client import GoogleAdsClient

OUTPUT_DIR = Path(__file__).resolve().parent.parent / "data" / "keyword-research"


def micros_to_usd(micros: int) -> float:
    return round(micros / 1_000_000, 2)


def main():
    if len(sys.argv) < 4:
        print(__doc__)
        sys.exit(1)

    customer_id = sys.argv[1]
    niche_slug = sys.argv[2]
    seed_keywords = sys.argv[3:]

    client = GoogleAdsClient.load_from_storage(version="v25")
    keyword_plan_idea_service = client.get_service("KeywordPlanIdeaService")

    request = client.get_type("GenerateKeywordIdeasRequest")
    request.customer_id = customer_id
    request.language = client.get_service("GoogleAdsService").language_constant_path("1000")  # English
    request.geo_target_constants.append(
        client.get_service("GoogleAdsService").geo_target_constant_path("2840")  # US
    )
    request.keyword_seed.keywords.extend(seed_keywords)
    request.keyword_plan_network = (
        client.enums.KeywordPlanNetworkEnum.GOOGLE_SEARCH
    )

    response = keyword_plan_idea_service.generate_keyword_ideas(request=request)

    rows = []
    for idea in response:
        metrics = idea.keyword_idea_metrics
        rows.append(
            {
                "keyword": idea.text,
                "search_volume": metrics.avg_monthly_searches,
                "geo": "US",
                "cpc_low": micros_to_usd(metrics.low_top_of_page_bid_micros),
                "cpc_high": micros_to_usd(metrics.high_top_of_page_bid_micros),
                "competition": metrics.competition.name,
                "top_ranking_domain": "",
                "source": "google_ads_api",
                "pulled_date": date.today().isoformat(),
            }
        )

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    out_path = OUTPUT_DIR / f"{niche_slug}-google_ads_api-{date.today().isoformat()}.csv"
    with out_path.open("w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=list(rows[0].keys()) if rows else [])
        writer.writeheader()
        writer.writerows(rows)

    print(f"Wrote {len(rows)} keyword ideas to {out_path}")


if __name__ == "__main__":
    main()
