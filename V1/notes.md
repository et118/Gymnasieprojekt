F = G*M*m/r^2

((5.9722*10^24)*(1.989*10^30)*(6.6743*10^-11))/(150000000000)


https://ssd.jpl.nasa.gov/horizons/ 
Check the API so that every time the program starts it grabs the current positions of every object in the solar system

https://ssd-api.jpl.nasa.gov/doc/horizons.html

https://ssd.jpl.nasa.gov/tools/sbdb_query.html#!#results 


SPK ids (IAU number)

https://ssd.jpl.nasa.gov/api/horizons.api?format=json&COMMAND=%27499%27&OBJ_DATA=%27YES%27&MAKE_EPHEM=%27YES%27&EPHEM_TYPE=%27VECTORS%27&CENTER=%27500@0%27&START_TIME=%272024-01-01%2000:00%27&STOP_TIME=%272024-01-01%2000:01%27&STEP_SIZE=%271%20min%27&VEC_TABLE=%272%27&VEC_LABELS=%27NO%27&CSV_FORMAT=%27YES%27