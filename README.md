# Guesty Heat Map Code challange

run service: 

```
npm install
npm run start
```

## Service
- This service will produce a heat map illustrating the 'most desired places' according to AirBnb unofficial API
- Producing the map may take a lot of time.
  - When the map will be ready, an email will be sent to the user with the URL to the heat map (TBD).
- Heat Map creation flow:
  - Fetching huge amount of listings
  - Rating the demand of a listing following parameters:
    - 3 months back availability rate
    - 3 weeks ahead availability rate
    - Reviews analyze by seeking keywords which indicate satisfaction from the location
  - Sorting all listing by demand score
  - Displaying only the first 10% of the entries
- Everything is configureable from the constants.js

#### Create map request example:
```
 curl \
-X GET \
"http://localhost:3000/create-heat-map"  \
-F "location=London" \
-F "email=youremail@gmail.com"
-F "property_type=Apartment"
```
#### Heat Map example:
[London](http://www.shavitc.com/guesty-heatmap-example/b2f9bcdb-3436-4eed-8655-1192e65e09e9.html)
