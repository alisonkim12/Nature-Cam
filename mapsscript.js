// import { liveVideos } from './get-cams.js';

function goBack() {
    window.history.back();
}
var videoVisible = false;
const mapTable = document.getElementById('map-table');
const videoId = "Q2zRgy1jUns";
const dataArray = [
    {
        "videoID" : "Q2zRgy1jUns",
        "videoTitle" : "Hello my name is Alison pizza poop",
        "videoChannel" : "Video Channel #1",
        "videoDescription" : "This video is about pretty squirrels and cheese pizza and halloween costumes. Please join in ...", 
        "iframeVideoSrc" : `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&showinfo=0&modestbranding=1`,
        "locationName": "Monterey Bay Aqaurium",
        "locationAddress" : "886 Cannery Row, Monterey, CA 93940",
        "locationXcoor": 36.61809,
        "locationYcoor": -121.90167
    },
    {
        "videoID" : "Q2zRgy1jUns",
        "videoTitle" : "This is the title of my second video!!!!",
        "videoChannel" : "ThisChannelisAwesome",
        "videoDescription" : "you didn't drive all this way just to see my mom didn't you? i mean obviously that would be crazy.", 
        "iframeVideoSrc" : `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&showinfo=0&modestbranding=1`,
        "locationName": "Austin, Texas",
        "locationAddress" : "Austin, Texas, USA",
        "locationXcoor": 30.27113,
        "locationYcoor": -97.74370
    },

    {
        "videoID" : "Q2zRgy1jUns",
        "videoTitle" : "Just get me a couple of days",
        "videoChannel" : "Bojack Horseman",
        "videoDescription" : "My career has kept me super busy. I really don't want to impose, if there is anything I can do to help please help me know.", 
        "iframeVideoSrc" : `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&showinfo=0&modestbranding=1`,
        "locationName": "Kyoto, Japan",
        "locationAddress" : "Kyoto, Japan",
        "locationXcoor": 35.02104,
        "locationYcoor": 135.75561
    },

    {
        "videoID" : "Q2zRgy1jUns",
        "videoTitle" : "Who needs a car when you have a boat?",
        "videoChannel" : "Princess Caroline",
        "videoDescription" : "Are you flirting with my boat right now? So does that mean you are leaving? You should at least stay until the weekend.", 
        "iframeVideoSrc" : `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&showinfo=0&modestbranding=1`,
        "locationName": "Swarthmore College",
        "locationAddress" : "500 College Ave Swarthmore, PA 19081",
        "locationXcoor": 39.90355,
        "locationYcoor": -75.35409
    },


    {
        "videoID" : "Q2zRgy1jUns",
        "videoTitle" : "Just get me a couple of days",
        "videoChannel" : "Bojack Horseman",
        "videoDescription" : "My career has kept me super busy. I really don't want to impose, if there is anything I can do to help please help me know.", 
        "iframeVideoSrc" : `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&showinfo=0&modestbranding=1`,
        "locationName": "Kyoto, Japan",
        "locationAddress" : "Kyoto, Japan",
        "locationXcoor": 35.02104,
        "locationYcoor": 135.75561
    },

    {
        "videoID" : "Q2zRgy1jUns",
        "videoTitle" : "Im getting you kids some bourbon. And cut it with water so you don't hungover.",
        "videoChannel" : "SighPoindexter",
        "videoDescription" : "A Night Under the Sea Under the Stars", 
        "iframeVideoSrc" : `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&showinfo=0&modestbranding=1`,
        "locationName": "Redwood National Park",
        "locationAddress" : "Highway 101, Orick, CA, Redwood National Park, CA 95555",
        "locationXcoor": 41.76807,
        "locationYcoor": -124.05050
    },

    {
        "videoID" : "Q2zRgy1jUns",
        "videoTitle" : "This prom sucks, my flask got empty.",
        "videoChannel" : "PromChannel",
        "videoDescription" : "You don't have to be here. Society is everywhere. Just get in the car. We can make the ground move.", 
        "iframeVideoSrc" : `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&showinfo=0&modestbranding=1`,
        "locationName": "Sydney Opera House",
        "locationAddress" : "2 Macquarie St, Sydney NSW 2000, Australia",
        "locationXcoor": -33.85720,
        "locationYcoor": 151.21512
    },

    {
        "videoID" : "Q2zRgy1jUns",
        "videoTitle" : "Don't make me go back to LA. You make me too sad. Okay",
        "videoChannel" : "I Know what I want",
        "videoDescription" : "Go to bed Penny. If you ever try to contact my family again I will fucking kill you.", 
        "iframeVideoSrc" : `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&showinfo=0&modestbranding=1`,
        "locationName": "Taj Mahal",
        "locationAddress" : "Dharmapuri, Forest Colony, Tajganj, Agra, IN 282001",
        "locationXcoor": 27.17501,
        "locationYcoor": 78.04210
    },

    {
        "videoID" : "Q2zRgy1jUns",
        "videoTitle" : "Ydfgfdgfgdfgdfgdfgdgfdgd",
        "videoChannel" : "So Wise",
        "videoDescription" : "Its amazing to me that peple wake up veveryday and say 'yay' how do they do it? So you see Todd, the nimble improviser must ...", 
        "iframeVideoSrc" : `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&showinfo=0&modestbranding=1`,
        "locationName": "Lotte World Adventure",
        "locationAddress" : "240 Olympic-ro, Songpa-gu, Seoul 05554, South Korea",
        "locationXcoor": 37.51150,
        "locationYcoor": 127.09824
    },

    {
        "videoID" : "Q2zRgy1jUns",
        "videoTitle" : "I'd Like You to Join Me in the High Seas",
        "videoChannel" : "",
        "videoDescription" : "We fixed the whole thing in post. Its going to make Daniel Dey Louis look like shit. Just think Caroline, in one week this will all be hours!", 
        "iframeVideoSrc" : `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&showinfo=0&modestbranding=1`,
        "locationName": "Palos Verdes Peninsula High School",
        "locationAddress" : "27118 Silver Spur Rd, Rolling Hills Estates, CA 90274, United States",
        "locationXcoor": 33.77985,
        "locationYcoor": -118.37221
    },
    {
        "videoID" : "Q2zRgy1jUns",
        "videoTitle" : "",
        "videoChannel" : "",
        "videoDescription" : "", 
        "iframeVideoSrc" : `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&showinfo=0&modestbranding=1`,
        "locationName": "Niagra Falls",
        "locationAddress" : "10 Rainbow Blvd, Niagara Falls, NY 14303, United States",
        "locationXcoor": 43.092461,
        "locationYcoor": -79.047150
    },


]

async function createTable() {
    // const dataArray = liveVideos;
    dataArray.forEach((item, index) => {
        const row = document.createElement('tr');
        row.classList.add('location-table-row');
        row.id = `location-row-${index}`
        row.style.borderTop = '1px solid white';
        row.addEventListener('click', ()=> {animateToLocation(item.locationYcoor, item.locationXcoor, item.videoID);});
        const plusSignCell = document.createElement('td');
        plusSignCell.classList.add('plus-sign');
        const descriptionCell = document.createElement('td');
        descriptionCell.classList.add('row-lat-long');
        descriptionCell.innerHTML = `<a class = "location-table-row-link">(  ${item.locationXcoor} , ${item.locationYcoor}  )</a>`;
        plusSignCell.textContent = '+';
        plusSignCell.style.cursor = 'pointer';
        plusSignCell.addEventListener('click', () => {toggleVideo(item, index);});
        row.appendChild(plusSignCell);
        row.appendChild(descriptionCell);
        mapTable.appendChild(row);
    });

    // Function to toggle video visibility
    function toggleVideo(item, index) {
        if (videoVisible == true) {
            mapTable.deleteRow(index+1);
            videoVisible = false;
        } else {
            var row = mapTable.rows[index];
            var newRow = mapTable.insertRow(index + 1);
            var filler_filler = newRow.insertCell(0);
            filler_filler.classList.add('filler');
            var videoInfoCell = newRow.insertCell(-1);
            videoInfoCell.classList.add('row-video-info');
            videoInfoCell.innerHTML = `<iframe class = "iframe-video" width="200" height="200" src="${item.iframeVideoSrc}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe><span class = "row-video-info-details"><span class = "video-location-name"><i class="ri-map-pin-2-fill"></i>${item.locationName}</span><span class = "row-video-info-title">${item.videoTitle}</span><span class = "video-location-addr"><i class="ri-pushpin-fill"></i> ${item.locationAddress}</span><span class = "video-description-text">${item.videoDescription}></span><a href = "https://www.youtube.com/watch?v=${item.videoId}">see on youtube <i class="ri-arrow-right-up-line"></i></a></span>`
            videoInfoCell.style.height = "fit-content"; // Adjust this value as needed
            videoVisible = true;
        }
    }

    // Change font color and background color on hover
    const rows = document.querySelectorAll('tr');
    rows.forEach(row => {
        row.addEventListener('mouseover', () => {
            row.style.color = 'black';
            row.style.backgroundColor = 'white';
        });
        row.addEventListener('mouseout', () => {
            row.style.color = '';
            row.style.backgroundColor = '';
        });
    });
}

var globe;
async function initiateMap() {
    globe = planetaryjs.planet();
    globe.loadPlugin(planetaryjs.plugins.earth({
        topojson: { file:   'world-110m.json' },
        oceans:   { fill:   '#000080' },
        land:     { fill:   '#339966' },
        borders:  { stroke: '#008000' }
    }));
    function autorotate(degPerSec) {
        // Planetary.js plugins are functions that take a `planet` instance
        // as an argument...
        return function(planet) {
          var lastTick = null;
          var paused = false;
          planet.plugins.autorotate = {
            pause:  function() { paused = true;  },
            resume: function() { paused = false; }
          };
          // ...and configure hooks into certain pieces of its lifecycle.
          planet.onDraw(function() {
            if (paused || !lastTick) {
              lastTick = new Date();
            } else {
              var now = new Date();
              var delta = now - lastTick;
              // This plugin uses the built-in projection (provided by D3)
              // to rotate the globe each time we draw it.
              var rotation = planet.projection.rotate();
              rotation[0] += degPerSec * delta / 1000;
              if (rotation[0] >= 180) rotation[0] -= 360;
              planet.projection.rotate(rotation);
              lastTick = now;
            }
          });
        };
      };

    globe.loadPlugin(autorotate(10));
    globe.loadPlugin(planetaryjs.plugins.zoom({
        scaleExtent: [50, 300]
      }));
      globe.loadPlugin(planetaryjs.plugins.drag({
        onDragStart: function() {
          this.plugins.autorotate.pause();
        },
        onDragEnd: function() {
          this.plugins.autorotate.resume();
        }
    }));
    globe.loadPlugin(planetaryjs.plugins.pings());
    // Create the canvas
    var canvas = document.getElementById('map-display');
    var width = canvas.offsetWidth;
    canvas.setAttribute('height', width + 'px');
    globe.projection.scale(70).translate([150, 100]);
    function updatePins() {
        globe.withSavedContext(function(context) {
          dataArray.forEach(function(d) {
            var coords = globe.projection([d.locationXcoor, d.locationYcoor]);
            context.strokeStyle = 'red'; // Pin color
            context.fillStyle = 'red'; // Pin color
            context.beginPath();
            context.arc(coords[0], coords[1], 5, 0, 2 * Math.PI);
            context.fill();
            context.stroke();
          });
        });
    }
    globe.loadPlugin(function(globe) {
    globe.onDraw(function() {
        updatePins();
    });
    })
    globe.draw(canvas);
}

// function animateToLocation(longitude, latitude, youtubeVideoId) {
//     // Move the globe to the specified location
//     globe.projection.rotate([-longitude, -latitude]);

//     // Create tooltip container
//     var tooltip = document.createElement('div');
//     tooltip.className = 'tooltip';
//     tooltip.innerHTML = '<iframe src="https://www.youtube.com/embed/' + youtubeVideoId + '" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>';
    
//     // Append tooltip to the body
//     document.body.appendChild(tooltip);

//     // Position tooltip at the specified location
//     var tooltipX = (longitude + 180) / 360 * window.innerWidth;
//     var tooltipY = (latitude + 90) / 180 * window.innerHeight;
//     tooltip.style.left = tooltipX + 'px';
//     tooltip.style.top = tooltipY + 'px';

//     // tooltip.remove();
// }

async function initiatePage() {
    await initiateMap();
    createTable();
}

initiatePage();