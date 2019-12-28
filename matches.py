import requests
import json
import csv
from headers import headers

OUTPUT_FILENAME = 'matches.csv'

MATCHES_URL = 'https://www.ancestry.co.uk/discoveryui-matchesservice/api/samples/{user_guid}/matchesv2?bookmarkdata={{"lastMatchesServicePageIdx":{page_number}}}'

USER_GUID = '34E617A6-092E-49C8-9A44-D1F8E9ABD255'

FIELD_NAMES = ['displayName', 'subjectGender', 'testGuid', 'createdDate', 'note']
RELATIONSHIP_FIELD_NAMES = ['meiosis', 'sharedCentimorgans', 'sharedSegments', 'confidence']

MAX_TOTAL_RETRIES = 10
MAX_RETRIES_PER_URL = 1

def main():
    session_requests = requests.session()

    with open(OUTPUT_FILENAME, 'w', newline='') as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=FIELD_NAMES + RELATIONSHIP_FIELD_NAMES)
        writer.writeheader()
        page_number = 0
        retries = 0
        retries_per_url = 0
        while True:
            print("page {}...".format(page_number + 1), end="")
            url = MATCHES_URL.format(user_guid=USER_GUID, page_number=page_number)
            result = session_requests.get(url, headers = headers())
            try:
                if json.loads(result.text)['matchCount'] == 0:
                    print("finished!")
                    break
                print("writing {} matches...".format(json.loads(result.text)['matchCount']), end="")
                write_match_groups(writer, json.loads(result.text)['matchGroups'])
                page_number += 1
                retries_per_url = 0
                print("done")
            except KeyError:
                print("{}...".format(json.loads(result.text).get('error')), end="")
                if (retries >= MAX_TOTAL_RETRIES) or (retries_per_url >= MAX_RETRIES_PER_URL):
                    print('too many errors, terminating')
                    break
                retries += 1
                retries_per_url += 1
                print('retrying')



def write_match_groups(writer, match_groups):
    for match_group in match_groups:
        #  print(match_group)
        for match in match_group['matches']:
            values = { field: match.get(field) for field in FIELD_NAMES }
            relationship_values = { field: match['relationship'][field] for field in RELATIONSHIP_FIELD_NAMES }
            values.update(relationship_values)
            writer.writerow(values)
                

if __name__ == '__main__':
    main()
