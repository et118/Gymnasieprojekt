import json, requests, csv

def getCelestialBody(target):
    url = "https://ssd.jpl.nasa.gov/api/horizons.api?format=json&COMMAND=%27TARGETBODY%27&OBJ_DATA=%27YES%27&MAKE_EPHEM=%27YES%27&EPHEM_TYPE=%27VECTORS%27&CENTER=%27500@0%27&START_TIME=%27STARTTIME%27&STOP_TIME=%27ENDTIME%27&STEP_SIZE=%271%20min%27&VEC_TABLE=%272%27&VEC_LABELS=%27NO%27&CSV_FORMAT=%27YES%27"
    url = url.replace("TARGETBODY", target)
    url = url.replace("STARTTIME", "2024-01-01%2000:00")
    url = url.replace("ENDTIME", "2024-01-01%2000:01")
    r = requests.get(url)
    data = json.loads(r.text)
    reader = csv.DictReader(data["result"])
    with open("celestialData.txt", "w") as file:
        file.write(json.dumps(data["result"]).replace("\"","").replace("\\n","\n"))


getCelestialBody("499")