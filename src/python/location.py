import spacy
from geopy.geocoders import Nominatim
import requests
import csv
from concurrent.futures import ThreadPoolExecutor
import sys
import json
import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
import re
# from itertools import permutations

def find_naturecam_locations(captions): 
    def process_locations(locations):
        locations = [loc for loc in locations if loc]
        if len(locations) == 1:
            return locations[0]
        max_length = 0
        max_object = {}
        max_objects = []
        for obj in locations:
            address_length = len(obj["location-address"])
            if address_length > max_length:
                max_length = address_length
                max_object = obj
            if obj["location-address"] == max_object["location-address"]: #same address
                max_objects.append(obj)
        
        if len(max_objects) == 1: 
            return max_object
        
        max_length = 0
        for obj in max_objects: 
            location_name_length = len(obj["location-name"])
            if location_name_length > max_length:
                max_length = location_name_length
                max_object = obj

        return max_object
    
    retry_strategy = Retry(
        total=5,
        status_forcelist=[429, 500, 502, 503, 504],
        backoff_factor=1
    )
    timeout_seconds = 20

    session = requests.Session()
    adapter = HTTPAdapter(max_retries=retry_strategy)
    session.mount("https://", adapter)
    session.mount("http://", adapter)
    session.timeout = timeout_seconds

    geolocator = Nominatim(user_agent="location_extractor")
    nlp = spacy.load("en_core_web_sm")
    response = requests.get('/api/maptiler-key')
    response.raise_for_status()
    data = response.json()
    api_key = data['key']

    def generate_combinations(source):
        words = source.split()
        combinations = []
        for i in range(len(words) - 1):
            for j in range(i + 1, min(i + 6, len(words))):
                combinations.append(' '.join(words[i:j]))
        return combinations

    def generate_substrings(sentence):
        # Split the original sentence into words and keep track of their positions
        words_with_positions = [(match.group(), match.start()) for match in re.finditer(r'\b\w+\b', sentence)]
        
        # Remove special characters from the sentence for clean comparison
        clean_sentence = re.sub(r'[^\w\s]', '', sentence)
        
        # Split the cleaned sentence into words
        clean_words = clean_sentence.split()
        
        # Generate substrings of length 1 to 5
        substrings = []
        substrings = []
        for length in range(1, 6):
            for i in range(len(clean_words) - length + 1):
                substring = clean_words[i:i + length]
                # Check if all words in the substring start with a capital letter
                if all(word.istitle() for word in substring):
                    # Construct the clean substring
                    clean_substring = " ".join(substring)
                    # Find the original positions of these words in the original sentence
                    original_start_pos = words_with_positions[i][1]
                    original_end_pos = words_with_positions[i + length - 1][1] + len(words_with_positions[i + length - 1][0])
                    
                    # Extract the corresponding segment from the original sentence
                    original_segment = sentence[original_start_pos:original_end_pos]
                    
                    # Check if the cleaned original segment matches the clean substring
                    original_segment_cleaned = re.sub(r'[^\w\s]', '', original_segment)
                    if original_segment_cleaned == clean_substring:
                        location_info = get_location_info(clean_substring)
                        if location_info:
                            substrings.append(location_info)
        return substrings

    def extract_locations(text):
        doc = nlp(text)
        locations = []
        # proper_noun_locations = [ent.text for ent in doc.ents if ent.label_ in ['GPE', 'LOC', 'FAC', 'ORG']]
        proper_noun_locations = [
            ' '.join(ent.text.split()[1:]) if ent.text.lower().startswith('the ') else ent.text
            for ent in doc.ents if ent.label_ in ['GPE', 'LOC', 'FAC', 'ORG']
        ]
        # print("proper_noun_locations: ", proper_noun_locations)
        for each_location in proper_noun_locations:
                locations.append(each_location)
        # word_test_list = generate_combinations(text)
        # for each_test in word_test_list:
        #     locations.extend(validate_locations(each_test))
        return locations    

    def validate_locations(text):
        url = f"https://maps.googleapis.com/maps/api/geocode/json?address={text}&key={api_key}"
        try:
            response = session.get(url)
            if response.status_code == 200:
                data = response.json()
                if data['status'] == 'OK':
                    return [text]
        except requests.RequestException as e:
            print(f"Error occurred: {e}")
        return []

    def get_location_info(location):
        url = f"https://maps.googleapis.com/maps/api/geocode/json?address={location}&key={api_key}"
        try:
            response = session.get(url)
            if response.status_code == 200:
                data = response.json()
                if data['status'] == 'OK':
                    result = data['results'][0]
                    latlong = result['geometry']['location']
                    location_info = {
                        "location-name": location,
                        "location-address": result['formatted_address'],
                        "location-x-coor": latlong['lat'],
                        "location-y-coor": latlong['lng']
                    }
                    return location_info
        except requests.RequestException as e:
            print(f"Error occurred: {e}")
        return None

    #narrow down to correct location name and address
    def single_location(locationData):
        def find_location_name_duplicates(locationData):
            location_count = {}
            duplicates = []
            # Counting the occurrences of each location address
            for location in locationData:
                name = location['location-name']
                if name in location_count:
                    location_count[name] += 1
                else:
                    location_count[name] = 1

            # Identifying duplicates and adding count to the duplicates list
            for location in locationData:
                name = location['location-name']
                if location_count[name] > 1 and not any(d[0]['location-name'] == name for d in duplicates):
                    duplicates.append((location, location_count[name]))

            return duplicates

        def find_location_address_duplicates(locationData):
            address_count = {}
            duplicates = []
            # Counting the occurrences of each location address
            for location in locationData:
                address = location['location-address']
                if address in address_count:
                    address_count[address] += 1
                else:
                    address_count[address] = 1

            # Identifying duplicates and adding count to the duplicates list
            for location in locationData:
                address = location['location-address']
                if address_count[address] > 1 and not any(d[0]['location-address'] == address for d in duplicates):
                    duplicates.append((location, address_count[address]))

            return duplicates

        if len(locationData) == 0:
            return []
        elif len(locationData) == 1: 
            return locationData[0]
        else: 
            location_name_duplicates = find_location_name_duplicates(locationData) #check for location name duplicates 
            if len(location_name_duplicates) > 0: 
                if len(location_name_duplicates) == 1: 
                    return location_name_duplicates[0][0]
                else: #more than one location name duplicate (find most specific address assuming they are in the same state/city)
                    longest_name_tuple = max(location_name_duplicates, key=lambda x: len(x[0]['location-name']))
                    return longest_name_tuple[0]
            else: #no location name duplicates, then find location address duplicates
                location_address_duplicates = find_location_address_duplicates(locationData) #check for location addr duplicates 
                if len(location_address_duplicates) > 0: 
                    if len(location_address_duplicates) == 1: #if there is location duplicate .... [how to discern location name]
                        return location_address_duplicates[0][0]
                    else: #more than one location addr duplicate (find most specific address assuming they are in the same state/city)
                        longest_address_tuple = max(location_address_duplicates, key=lambda x: len(x[0]['location-address']))
                        return longest_address_tuple[0]
                else: #no location addr duplicates.... then return most specific location
                    longest_address = max(locationData, key=lambda x: len(x['location-address']))
                    return longest_address

    def process_caption(caption):
        locations = extract_locations(caption)
        locationData = generate_substrings(caption)
        with ThreadPoolExecutor(max_workers=5) as executor:
            location_info_list = executor.map(get_location_info, locations)
            for info in location_info_list:
                if info:
                    locationData.append(info)
        #narrow down to correct location name and address
        return locationData

    map_data_full = []
    with ThreadPoolExecutor(max_workers=5) as executor:
        map_data_lists = executor.map(process_caption, captions)
        if map_data_lists: 
            for map_data in map_data_lists:
                if map_data is not None: 
                    map_data_full.extend(map_data)
    # return process_locations(map_data_full)
    return single_location(map_data_full)

if __name__ == "__main__":
    try:
        param = json.loads(sys.argv[1])
        result = find_naturecam_locations(param)
        print(json.dumps(result))
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)

# def read_csv_file():
#     lines = []
#     with open('../../location-data.csv', 'r', newline='', encoding='utf-8') as csvfile:
#         csvreader = csv.reader(csvfile)
#         for row in csvreader:
#             lines.append(row)
#     return lines

# def find_naturecam_locations(captions): 
#     def process_locations(locations):
#         locations = [loc for loc in locations if loc]
#         if len(locations) == 1:
#             return locations[0]
#         max_length = 0
#         max_object = {}
#         max_objects = []
#         for obj in locations:
#             address_length = len(obj["location-address"])
#             if address_length > max_length:
#                 max_length = address_length
#                 max_object = obj
#             if obj["location-address"] == max_object["location-address"]: #same address
#                 max_objects.append(obj)
        
#         if len(max_objects) == 1: 
#             return max_object
        
#         max_length = 0
#         for obj in max_objects: 
#             location_name_length = len(obj["location-name"])
#             if location_name_length > max_length:
#                 max_length = location_name_length
#                 max_object = obj

#         return max_object
    
#     retry_strategy = Retry(
#         total=5,
#         status_forcelist=[429, 500, 502, 503, 504],
#         backoff_factor=1
#     )
#     timeout_seconds = 20

#     session = requests.Session()
#     adapter = HTTPAdapter(max_retries=retry_strategy)
#     session.mount("https://", adapter)
#     session.mount("http://", adapter)
#     session.timeout = timeout_seconds

#     geolocator = Nominatim(user_agent="location_extractor")
#     # api_key = "AIzaSyDCTVjOjE4TehokJZy9Ar8MYrTFquQ1vbg"
#     api_key = "AIzaSyAepEGY8kS0T7mibKCEQjLFBUkXTXUV-7o"
#     nlp = spacy.load("en_core_web_sm")

#     def generate_combinations(source):
#         words = source.split()
#         combinations = []
#         for i in range(len(words) - 1):
#             for j in range(i + 1, min(i + 6, len(words))):
#                 combinations.append(' '.join(words[i:j]))
#         return combinations

#     # def extract_locations(text):
#     #     doc = nlp(text)
#     #     locations = []
#     #     proper_noun_locations = [ent.text for ent in doc.ents if ent.label_ in ['GPE', 'LOC', 'FAC', 'ORG']]
#     #     print("proper_noun_locations: ", proper_noun_locations)
#     #     for each_location in proper_noun_locations:
#     #         locations.append(each_location)
#     #     # word_test_list = generate_combinations(text)
#     #     # for each_test in word_test_list:
#     #     #     locations.extend(validate_locations(each_test))
#     #     return locations

#     # def is_location(name):
#     #     try:
#     #         location = geolocator.geocode(name)
#     #         return location is not None
#     #     except:
#     #         return False

#     # def extract_locations_geolocator(text): #takes a really long time to run
#     #     potential_locations = generate_combinations(text)
#     #     verified_locations = []
#     #     for loc in potential_locations:
#     #         if is_location(loc):
#     #             verified_locations.append(loc)
#     #     print("gazzetteer based locations: ", verified_locations)
#     #     return verified_locations

#     def generate_substrings(sentence):
#         # Split the original sentence into words and keep track of their positions
#         words_with_positions = [(match.group(), match.start()) for match in re.finditer(r'\b\w+\b', sentence)]
        
#         # Remove special characters from the sentence for clean comparison
#         clean_sentence = re.sub(r'[^\w\s]', '', sentence)
        
#         # Split the cleaned sentence into words
#         clean_words = clean_sentence.split()
        
#         # Generate substrings of length 1 to 5
#         substrings = []
#         substrings = []
#         for length in range(1, 6):
#             for i in range(len(clean_words) - length + 1):
#                 substring = clean_words[i:i + length]
#                 # Check if all words in the substring start with a capital letter
#                 if all(word.istitle() for word in substring):
#                     # Construct the clean substring
#                     clean_substring = " ".join(substring)
#                     # Find the original positions of these words in the original sentence
#                     original_start_pos = words_with_positions[i][1]
#                     original_end_pos = words_with_positions[i + length - 1][1] + len(words_with_positions[i + length - 1][0])
                    
#                     # Extract the corresponding segment from the original sentence
#                     original_segment = sentence[original_start_pos:original_end_pos]
                    
#                     # Check if the cleaned original segment matches the clean substring
#                     original_segment_cleaned = re.sub(r'[^\w\s]', '', original_segment)
#                     if original_segment_cleaned == clean_substring:
#                         location_info = get_location_info(clean_substring)
#                         if location_info:
#                             substrings.append(location_info)

#         print("generate_substrings:...")
#         print(substrings)
#         return substrings

#     def extract_locations(text):
#         doc = nlp(text)
#         locations = []
#         # proper_noun_locations = [ent.text for ent in doc.ents if ent.label_ in ['GPE', 'LOC', 'FAC', 'ORG']]
#         proper_noun_locations = [
#             ' '.join(ent.text.split()[1:]) if ent.text.lower().startswith('the ') else ent.text
#             for ent in doc.ents if ent.label_ in ['GPE', 'LOC', 'FAC', 'ORG']
#         ]
#         print("proper_noun_locations: ", proper_noun_locations)
#         for each_location in proper_noun_locations:
#                 locations.append(each_location)
#         # word_test_list = generate_combinations(text)
#         # for each_test in word_test_list:
#         #     locations.extend(validate_locations(each_test))
#         return locations    

#     def validate_locations(text):
#         url = f"https://maps.googleapis.com/maps/api/geocode/json?address={text}&key={api_key}"
#         try:
#             response = session.get(url)
#             if response.status_code == 200:
#                 data = response.json()
#                 if data['status'] == 'OK':
#                     return [text]
#         except requests.RequestException as e:
#             print(f"Error occurred: {e}")
#         return []

#     def get_location_info(location):
#         url = f"https://maps.googleapis.com/maps/api/geocode/json?address={location}&key={api_key}"
#         try:
#             response = session.get(url)
#             if response.status_code == 200:
#                 data = response.json()
#                 if data['status'] == 'OK':
#                     result = data['results'][0]
#                     latlong = result['geometry']['location']
#                     location_info = {
#                         "location-name": location,
#                         "location-address": result['formatted_address'],
#                         "location-x-coor": latlong['lat'],
#                         "location-y-coor": latlong['lng']
#                     }
#                     return location_info
#         except requests.RequestException as e:
#             print(f"Error occurred: {e}")
#         return None

#     #narrow down to correct location name and address
#     def single_location(locationData):
#         def find_location_name_duplicates(locationData):
#             location_count = {}
#             duplicates = []
#             # Counting the occurrences of each location address
#             for location in locationData:
#                 name = location['location-name']
#                 if name in location_count:
#                     location_count[name] += 1
#                 else:
#                     location_count[name] = 1

#             # Identifying duplicates and adding count to the duplicates list
#             for location in locationData:
#                 name = location['location-name']
#                 if location_count[name] > 1 and not any(d[0]['location-name'] == name for d in duplicates):
#                     duplicates.append((location, location_count[name]))

#             return duplicates

#         def find_location_address_duplicates(locationData):
#             address_count = {}
#             duplicates = []
#             # Counting the occurrences of each location address
#             for location in locationData:
#                 address = location['location-address']
#                 if address in address_count:
#                     address_count[address] += 1
#                 else:
#                     address_count[address] = 1

#             # Identifying duplicates and adding count to the duplicates list
#             for location in locationData:
#                 address = location['location-address']
#                 if address_count[address] > 1 and not any(d[0]['location-address'] == address for d in duplicates):
#                     duplicates.append((location, address_count[address]))

#             return duplicates

#         if len(locationData) == 0:
#             return None
#         elif len(locationData) == 1: 
#             return locationData
#         else: 
#             location_name_duplicates = find_location_name_duplicates(locationData) #check for location name duplicates 
#             if len(location_name_duplicates) > 0: 
#                 if len(location_name_duplicates) == 1: 
#                     return location_name_duplicates[0][0]
#                 else: #more than one location name duplicate (find most specific address assuming they are in the same state/city)
#                     longest_name_tuple = max(location_name_duplicates, key=lambda x: len(x[0]['location-name']))
#                     return longest_name_tuple[0]
#             else: #no location name duplicates, then find location address duplicates
#                 location_address_duplicates = find_location_address_duplicates(locationData) #check for location addr duplicates 
#                 if len(location_address_duplicates) > 0: 
#                     if len(location_address_duplicates) == 1: #if there is location duplicate .... [how to discern location name]
#                         return location_address_duplicates[0][0]
#                     else: #more than one location addr duplicate (find most specific address assuming they are in the same state/city)
#                         longest_address_tuple = max(location_address_duplicates, key=lambda x: len(x[0]['location-address']))
#                         return longest_address_tuple[0]
#                 else: #no location addr duplicates.... then return most specific location
#                     longest_address = max(locationData, key=lambda x: len(x['location-address']))
#                     return longest_address

#     def process_caption(caption):
#         locations = extract_locations(caption)
#         locationData = generate_substrings(caption)
#         with ThreadPoolExecutor(max_workers=5) as executor:
#             location_info_list = executor.map(get_location_info, locations)
#             for info in location_info_list:
#                 if info:
#                     locationData.append(info)
#         #narrow down to correct location name and address
#         return locationData

#     map_data_full = []
#     with ThreadPoolExecutor(max_workers=5) as executor:
#         map_data_lists = executor.map(process_caption, captions)
#         if map_data_lists is not None: 
#             for map_data in map_data_lists:
#                 if map_data is not None: 
#                     map_data_full.extend(map_data)
#     # return process_locations(map_data_full)
#     return single_location(map_data_full)

# captions = read_csv_file()

# with open('output2.csv', mode='w', newline='') as file:
#     writer = csv.writer(file)
#     writer.writerow(['Video_title', 'Video_description', 'Location_name', 'Location_address', 'Location_x_coor', 'Location_y_coor'])
    
#     for i in range(len(captions)):
#         video_title = captions[i][0]
#         video_description = captions[i+1][0]
#         location_data = find_naturecam_locations([video_title, video_description])
#         if location_data == {}: 
#             location_data = {
#                 "location-name": None,
#                 "location-address": None,
#                 "location-x-coor": 0,
#                 "location-y-coor": 0
#             }
#         # print(location_data)
#         # print(location_data["location-name"])

#         writer.writerow([video_title, video_description, location_data["location-name"], location_data["location-address"], location_data["location-x-coor"], location_data["location-y-coor"]])


# for i in range(0, len(captions), 2): 
#     print("Video title: ", captions[i][0])
#     print("Video description: ", captions[i+1][0])
#     # print([captions[i][0],captions[i+1][0]])
#     print("Location data: ", find_naturecam_locations([captions[i][0],captions[i+1][0]]))
#     print("--------------------------------")




# # for every_location in locations: 
#     #         if (every_location['location-x-coor'] == max_object['location-x-coor']) and (every_location['location-y-coor'] == max_object['location-y-coor']):
#     #             return every_location
#     # max_decimal_places = 0
#     # most_specific_coords = {'location-x-coor': None, 'location-y-coor': None}
#     # most_specific_location = {}
#     # for loc in locations:
#     #     for key in loc.keys():
#     #         if isinstance(loc[key], float):
#     #             decimal_places = len(str(loc[key]).split('.')[1])
#     #             if decimal_places > max_decimal_places:
#     #                 max_decimal_places = decimal_places
#     #                 most_specific_coords['location-x-coor'] = loc['location-x-coor']
#     #                 most_specific_coords['location-y-coor'] = loc['location-y-coor']
#     #                 most_specific_location = loc
#     # seen = set()
#     # duplicates = {}
#     # for obj in locations:
#     #     key = (obj.get('location-address'), obj.get('location-x-coor'), obj.get('location-y-coor'))
#     #     if key in seen:
#     #         if key not in duplicates:
#     #             duplicates[key] = [obj]
#     #         else:
#     #             duplicates[key].append(obj)
#     #     else:
#     #         seen.add(key)
#     # if duplicates:
#     #     most_common_locations = [{'location-address': key[0], 'location-x-coor': key[1], 'location-y-coor': key[2]} for key in duplicates.keys() if len(duplicates[key]) > 1]
#     #     for every_location in most_common_locations: 
#     #         if (every_location['location-x-coor'] == max_object['location-x-coor']) and (every_location['location-y-coor'] == max_object['location-y-coor']):
#     #             return every_location
    
#     # return max_object, most_specific_location #sometimes the they are the same so check for that duplicate


# if __name__ == "__main__":
#     param = sys.argv[1]
#     result = find_naturecam_locations(param)
#     print(json.dumps(result))