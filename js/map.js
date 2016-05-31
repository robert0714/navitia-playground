var map = {
    makeFeatures: {
        section: function(json) {
            if (!( "geojson" in json)) {
               return [];
            }
            return [
                L.geoJson(json.geojson, {
                    style: function() {
                        var color = '#fff';
                        if ("display_informations" in json) {
                            color = getTextColor(json.display_informations);
                        }
                        return {
                            color: color,
                            weight: 7,
                            opacity: 1
                        };
                    }
                }),
                L.geoJson(json.geojson, {
                    style: function() {
                        var color = '#008ACA';
                        if ("display_informations" in json) {
                            color = "#" + json.display_informations.color;
                        }
                        return {
                            color: color,
                            weight: 5,
                            opacity: 1
                        };
                    }
                })
            ];
        },
        journey: function(json) {
            return flatMap(json.sections, map.makeFeatures.section);
        },
        response: function(json) {
            var key = responseCollectionName(json);
            if (key === null) {
                return [];
            }
            var type = getType(key);
            if (!(type in map.makeFeatures)) {
                return [];
            }
            return flatMap(json[key], map.makeFeatures[type]);
        }
    },
    
    run: function(type, json) {
        var div = $('<div/>');
        if (typeof map.makeFeatures[type] == 'function') {
            div.addClass('leaflet');
            var m = L.map(div.get(0)).setView([48.843693, 2.373303], 13);
            mapLink = '<a href="http://openstreetmap.org">OpenStreetMap</a>';
            mapquestLink = '<a href="http://www.mapquest.com//">MapQuest</a>';
            mapquestPic = '<img src="http://developer.mapquest.com/content/osm/mq_logo.png">';
            L.tileLayer(
                'http://otile{s}.mqcdn.com/tiles/1.0.0/map/{z}/{x}/{y}.png', {
                    attribution: '&copy; '+mapLink+'. Tiles courtesy of '+mapquestLink+mapquestPic,
                    maxZoom: 17,
                    subdomains: '1234',
            }).addTo(m);
            var overlay = L.featureGroup(map.makeFeatures[type](json)).addTo(m);
            setTimeout(function(){ m.invalidateSize(), m.fitBounds(overlay.getBounds());}, 100);
        } else {
            div.addClass('noMap');
            div.append('No map');
        }
        return div;
    }
};
