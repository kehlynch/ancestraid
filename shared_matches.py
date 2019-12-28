import requests
import json
import csv
from headers import headers

OUTPUT_FILENAME = 'results.csv'

MATCHES_URL = "https://www.ancestry.co.uk/discoveryui-matchesservice/api/samples/34E617A6-092E-49C8-9A44-D1F8E9ABD255/matchesv2?page={page_number}"
URL = "https://www.ancestry.co.uk/discoveryui-matchesservice/api/samples/{user_guid}/matchesv2?page=1&relationguid={match_guid}"

USER_GUID = '34E617A6-092E-49C8-9A44-D1F8E9ABD255'
MATCH_GUIDS = [
    # Kathleen Hayes
    'e7cda22a-8ade-43a6-9f8b-5f943a134a7b',
    # Jason Hill
    '2c57ef75-1a2a-404f-a2b0-f2d53a0af9c6',
    # Martin MacDonagh
    'ee61b3c6-3dad-4bd9-827f-a7089bbdb2e8',
    # Arthu George
    '5371cb24-cedf-4f4c-baec-7c937dd47b68',
    # no results
    'd6bb0e28-767f-414e-822d-31e00a52d711'
]

FIELD_NAMES = ['displayName', 'subjectGender', 'testGuid', 'createdDate', 'note']
RELATIONSHIP_FIELD_NAMES = ['meiosis', 'sharedCentimorgans', 'sharedSegments', 'confidence']

def main():
    session_requests = requests.session()

    with open(OUTPUT_FILENAME, 'w', newline='') as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=['sourceGuid'] + FIELD_NAMES + RELATIONSHIP_FIELD_NAMES)
        writer.writeheader()
        for match_guid in MATCH_GUIDS:
            url = URL.format(user_guid=USER_GUID, match_guid=match_guid)
            result = session_requests.get(url, headers = headers())
            if json.loads(result.text).get('matchGroups'):
                write_match_groups(writer, json.loads(result.text)['matchGroups'], match_guid)

def write_match_groups(writer, match_groups, match_guid):
    for match_group in match_groups:
        #  print(match_group)
        for match in match_group['matches']:
            values = { field: match.get(field) for field in FIELD_NAMES }
            relationship_values = { field: match['relationship'][field] for field in RELATIONSHIP_FIELD_NAMES }
            values.update(relationship_values)
            values['sourceGuid'] = match_guid
            writer.writerow(values)
                

if __name__ == '__main__':
    main()
