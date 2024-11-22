from astroquery.jplhorizons import Horizons

def get_moon_ids(planet_name):
    """
    Fetch SPK IDs of moons orbiting a specific planet using the NASA Horizons API.

    Parameters:
    - planet_name (str): The name of the planet (e.g., 'Jupiter', 'Saturn').

    Returns:
    - dict: A dictionary with moon names as keys and their SPK IDs as values.
    """
    try:
        # Query Horizons for the planet's system
        obj = Horizons(id=planet_name, location="@sun", id_type='majorbody')
        ephemeris = obj.ephemerides()
        
        
        # Fetch satellites of the planet
        sat_query = Horizons(id=planet_name + " barycenter", location="@sun", id_type='majorbody')
        sats = sat_query.names()
        
        # Filter and extract satellite data
        moons = {sat['name']: sat['id'] for sat in sats if "Satellite" in sat['type']}
        return moons

    except Exception as e:
        print(f"Error: {e}")
        return {}

# Example usage
planet = "301"  # Change to your desired planet (e.g., Saturn, Uranus)
moons = get_moon_ids(planet)

if moons:
    print(f"Moons of {planet}:")
    for name, spk_id in moons.items():
        print(f"{name}: {spk_id}")
else:
    print(f"No moons found for {planet}.")
