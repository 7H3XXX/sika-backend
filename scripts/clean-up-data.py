import json
import random

# Load JSON data
with open("data/organisations.json", "r") as f:
    orgs: list[dict] = json.load(f)
org_names = [org.get("name") for org in orgs]

with open("data/job-skills.json", "r") as f:
    skills: list[dict] = json.load(f)
skill_names = [skill.get("name") for skill in skills]

with open("data/job-categories.json", "r") as f:
    categories: list[dict] = json.load(f)
category_names = [category.get("name") for category in categories]

with open("data/job-listings.json", "r") as f:
    listings: list[dict] = json.load(f)

# Process Data
for listing in listings:
    if listing.get("oragnisationName") not in org_names:
        listing.update({"oragnisationName": random.choice(org_names)})
    if listing.get("categoryName") not in category_names:
        listing.update({"categoryName": random.choice(category_names)})
    for skill in listing.get("skills"):
        if skill not in skill_names:
            skills.append({"name": skill})

# Serialize New Data to a JSON to file
with open("job-listings-new.json", "w") as f:
    json.dump(listings, f)

with open("job-skills-new.json", "w") as f:
    json.dump([
        {"name": skill_name} for skill_name in
        set(skill.get("name") for skill in skills)
    ], f)
