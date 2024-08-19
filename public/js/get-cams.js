// Define the column names and initialize the CSV content
const columns = ["videoID", "videoTitle", "videoChannelName", "videoDescription", "iframeVideoSrc", "locationName", "locationAddress", "location_X_coor", "location_Y_coor"];
const CHANNEL_IDS = ['UCsFgbVuhRrPV5FqyN7kOD8g', 'UCRPhYF9rd5ov7DNKj99MNIg', 'UC3DWrk_z1sH3ix1QNQTFr7w', 'UC-2KSeUU5SMCX6XLRD-AEvw', 'UCSyg9cb3Iq-NtlbxqNB9wGw', 'UCRPhYF9rd5ov7DNKj99MNIg', 'UCtllXAWa3EcfcsL5tvpqGSw', 'UCbzl-qtfTKY9QNgtnqmuyBw', 'UCUtGnX65osNPQ98Y3-SSgpg', 'UCaLACDf5aXquc4-i89vfyqg', 'UCarKzF2g4RXDOZLy-VBd_MA', 'UCnM5iMGiKsZg-iOlIO2ZkdQ', 'UC2Sk0aXLq3ADkH_USGPKT_Q', 'UCl-QNzkm3zAmoCqedCL1EPQ', 'UC9X6gGKDv2yhMoofoeS7-Gg', 'UCuL60_Ko4m9xCaa4QDNgJrw', 'UCkN99tb9rDWsS3c5mKwWsJw', 'UCuoNAKa3P0QR1Lw9QdpmoVg', 'UC-whuqv4HIi1O9hh9CHpPJg', 'UCwKZbPPsC3feAft_2CXLzRQ', 'UCDPk9MG2RexnOMGTD-YnSnA', 'UCx8KaDsE0B4HsQdNBCsvyaA', 'UCyC-ZovqS5MD-A9Iz0f8RAw', 'UCaG0IHN1RMOZ4-U3wDXAkwA', 'UCK9WO9hqKmaAccZqCgeOw4w', 'UC-HQ-oPvL148RmDxpV4jzlQ', 'UC5lMzpZvCLpwyvu348B8zYw'];
const MAX_RESULTS = 1;
const cacheExpiration = 300; // Cache expiration time in seconds (e.g., 5 minutes)
const MAX_DAILY_QUERIES = 100; // Set daily limit for API queries
const STORAGE_KEY = 'youtube_api_query_count';
const LAST_RESET_KEY = 'youtube_api_last_reset';
let API_KEY;

fetch('/api/youtube-key')
  .then(response => response.json())
  .then(data => {
        API_KEY = data.key;
  })
  .catch(error => console.error('Error fetching the Youtube API key:', error));

const iframeVideoOne = document.getElementById('video-1');
const iframeVideoTwo = document.getElementById('video-2');
const iframeVideoThree = document.getElementById('video-3');
const iframeVideoFour = document.getElementById('video-4');
const videoOneCoord = document.getElementById('video-1-location-coord');
const videOneAddr = document.getElementById('video-1-location-address');
const videoOneName = document.getElementById('video-1-location-name');
const videoTwoCoord = document.getElementById('video-2-location-coord');
const videoTwoAddr = document.getElementById('video-2-location-address');
const videoTwoName = document.getElementById('video-2-location-name');
const videoThreeCoord = document.getElementById('video-3-location-coord');
const videoThreeAddr = document.getElementById('video-3-location-address');
const videoThreeName = document.getElementById('video-3-location-name');
const videoFourCoord = document.getElementById('video-4-location-coord');
const videoFourAddr = document.getElementById('video-4-location-address');
const videoFourName = document.getElementById('video-4-location-name');
const loadingMessage = document.getElementById('loading-text');

const liveVideos = [];

async function callPythonFunction(param) {
    console.log("Calling Python function with parameters:", param);
    try {
        const response = await fetch('/callPythonFunction', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                functionName: 'find_naturecam_locations',
                param: param
            })
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        return data.result;
    } catch (error) {
        console.error('Error calling Python function:', error);
        throw error; // rethrow the error if needed
    }
}

async function fetchLiveVideos(channelId) {
    // Check and update the daily query count
    const queryData = JSON.parse(localStorage.getItem(STORAGE_KEY)) || { count: 0 };
    const lastResetDate = localStorage.getItem(LAST_RESET_KEY);
    const today = new Date().toISOString().split('T')[0]; // Get YYYY-MM-DD format

    if (lastResetDate !== today) {
        // Reset the count if the date has changed
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ count: 0 }));
        localStorage.setItem(LAST_RESET_KEY, today);
    }

    if (queryData.count >= MAX_DAILY_QUERIES) {
        // Daily limit reached
        throw new Error('Daily API query limit reached');
        return 
    }

    const cacheKey = `live_videos_${channelId}`;

    return new Promise((resolve, reject) => {
        // Simulate caching for browser environment
        const cachedData = sessionStorage.getItem(cacheKey);
        if (cachedData) {
            console.log(`Cache hit for channel ${channelId}`);
            resolve(JSON.parse(cachedData));
        } else {
            console.log(`Cache miss for channel ${channelId}`);
            // fetch(`https://www.googleapis.com/youtube/v3/search?key=${API_KEY}&channelId=${channelId}&part=snippet,status&type=video&eventType=live&order=viewCount&maxResults=${MAX_RESULTS}`)
                // fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&key=${API_KEY}`)
            fetch(`https://www.googleapis.com/youtube/v3/search?key=${API_KEY}&channelId=${channelId}&part=snippet&type=video&eventType=live&order=viewCount&maxResults=${MAX_RESULTS}`)
                .then(response => {
                    if (!response.ok) {
                        return response.json().then(err => {
                            throw new Error(`HTTP error! status: ${response.status}, error: ${JSON.stringify(err)}`);
                        });
                    }
                    return response.json();
                })
                .then(async data => {
                    const videoIds = data.items.map(item => item.id.videoId).join(',');
                    const videoDetailsResponse = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${videoIds}&key=${API_KEY}`);
                    const videoDetailsData = await videoDetailsResponse.json();
                    
                    const playableVideos = data.items.filter((item, index) => {
                        const videoDetails = videoDetailsData.items[index].contentDetails;
                        return !videoDetails.regionRestriction;
                    });

                    sessionStorage.setItem(cacheKey, JSON.stringify(playableVideos));
                    resolve(playableVideos);
                })
                .catch(error => {
                    console.error('Error fetching live videos:', error);
                    reject(error);
                });
        }
    });
}

async function getFullVideoInfo(liveVideosFromChannel) {
    const videoPromises = liveVideosFromChannel.map(async video => {
        let result = await getLocations(video.snippet.title, video.snippet.description);
        console.log("Location result: ", result);

        if (result.length === 0) {
            return {
                videoID: video.id.videoId,
                videoTitle: video.snippet.title,
                videoChannelName: video.snippet.channelTitle,
                videoDescription: video.snippet.description,
                iframeVideoSrc: `https://www.youtube.com/embed/${video.id.videoId}?autoplay=1`,
                locationName: "",
                locationAddress: "",
                locationXcoor: 0,
                locationYcoor: 0
            };
        } else {
            return {
                videoID: video.id.videoId,
                videoTitle: video.snippet.title,
                videoChannelName: video.snippet.channelTitle,
                videoDescription: video.snippet.description,
                iframeVideoSrc: `https://www.youtube.com/embed/${video.id.videoId}?autoplay=1`,
                locationName: result['location-name'],
                locationAddress: result['location-address'],
                locationXcoor: result['location-x-coor'],
                locationYcoor: result['location-y-coor']
            };
        }
    });
    const resolvedVideos = await Promise.all(videoPromises);
    liveVideos.push(...resolvedVideos);
}


async function getLocations(videoTitle, videoDescription){
    console.log("Getting locations for: ", videoTitle);
    let modifiedTitle = videoTitle.replace(/"/g, '\\"');
    modifiedTitle = modifiedTitle.replace(/['"]/g, "");
    let modifiedDescription = videoDescription.replace(/"/g, '\\"');
    modifiedDescription = modifiedDescription.replace(/['"]/g, "");
    const result = await callPythonFunction([modifiedTitle, modifiedDescription]);
    return result;
}

async function loadInitialVideos(liveVideos) {
    loadingMessage.style.opacity = "0";
    loadingMessage.style.display = "none";
    iframeVideoOne.src = liveVideos[0].iframeVideoSrc;
    iframeVideoOne.title = liveVideos[0].videoTitle;
    iframeVideoTwo.src = liveVideos[1].iframeVideoSrc;
    iframeVideoTwo.title = liveVideos[1].videoTitle;
    iframeVideoThree.src = liveVideos[2].iframeVideoSrc;
    iframeVideoThree.title = liveVideos[3].videoTitle;
    iframeVideoFour.src = liveVideos[3].iframeVideoSrc;
    iframeVideoFour.title = liveVideos[3].videoTitle;


    // Update DOM elements with video information
    videoOneName.innerText = `${liveVideos[0].locationName}`;
    videoOneCoord.innerText = `(${liveVideos[0].locationXcoor} , ${liveVideos[0].locationYcoor})`;
    videOneAddr.innerText = `${liveVideos[0].locationAddress}`;
    videoTwoName.innerText = `${liveVideos[1].locationName}`;
    videoTwoCoord.innerText = `(${liveVideos[1].locationXcoor} , ${liveVideos[1].locationYcoor})`;
    videoTwoAddr.innerText = `${liveVideos[1].locationAddress}`;
    videoThreeName.innerText = `${liveVideos[2].locationName}`;
    videoThreeCoord.innerText = `(${liveVideos[2].locationXcoor} , ${liveVideos[2].locationYcoor})`;
    videoThreeAddr.innerText = `${liveVideos[2].locationAddress}`;
    videoFourName.innerText = `${liveVideos[3].locationName}`;
    videoFourCoord.innerText = `(${liveVideos[3].locationXcoor} , ${liveVideos[3].locationYcoor})`;
    videoFourAddr.innerText = `${liveVideos[3].locationAddress}`;

    const shuffleButton = document.querySelector('#shuffle-button a');
    shuffleButton.addEventListener('click', () => {
        shuffleVideos(liveVideos);
    })
}

function shuffleVideos(liveVideos) {
    let result = new Set(); // Use a Set to ensure uniqueness
    while (result.size < 4) {
        const randomInt = Math.floor(Math.random() * liveVideos.length);
        result.add(randomInt);
    }
    const fourVideos = Array.from(result);

    // Set iframe src and update DOM elements
    iframeVideoOne.src = liveVideos[fourVideos[0]].iframeVideoSrc;
    iframeVideoTwo.src = liveVideos[fourVideos[1]].iframeVideoSrc;
    iframeVideoThree.src = liveVideos[fourVideos[2]].iframeVideoSrc;
    iframeVideoFour.src = liveVideos[fourVideos[3]].iframeVideoSrc;

    // Update DOM elements with video information
    videoOneName.innerText = `${liveVideos[fourVideos[0]].locationName}`;
    videoOneCoord.innerText = `(${liveVideos[fourVideos[0]].locationXcoor} , ${liveVideos[fourVideos[0]].locationYcoor})`;
    videOneAddr.innerText = `${liveVideos[fourVideos[0]].locationAddress}`;
    videoTwoName.innerText = `${liveVideos[fourVideos[1]].locationName}`;
    videoTwoCoord.innerText = `(${liveVideos[fourVideos[1]].locationXcoor} , ${liveVideos[fourVideos[1]].locationYcoor})`;
    videoTwoAddr.innerText = `${liveVideos[fourVideos[1]].locationAddress}`;
    videoThreeName.innerText = `${liveVideos[fourVideos[2]].locationName}`;
    videoThreeCoord.innerText = `(${liveVideos[fourVideos[2]].locationXcoor} , ${liveVideos[fourVideos[2]].locationYcoor})`;
    videoThreeAddr.innerText = `${liveVideos[fourVideos[2]].locationAddress}`;
    videoFourName.innerText = `${liveVideos[fourVideos[3]].locationName}`;
    videoFourCoord.innerText = `(${liveVideos[fourVideos[3]].locationXcoor} , ${liveVideos[fourVideos[3]].locationYcoor})`;
    videoFourAddr.innerText = `${liveVideos[fourVideos[3]].locationAddress}`;
}

// function downloadCSV(content, filename) {
//     const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
//     if (navigator.msSaveBlob) { // IE 10+
//         navigator.msSaveBlob(blob, filename);
//     } else {
//         const link = document.createElement('a');
//         if (link.download !== undefined) {
//             const url = URL.createObjectURL(blob);
//             link.setAttribute('href', url);
//             link.setAttribute('download', filename);
//             link.style.visibility = 'hidden';
//             document.body.appendChild(link);
//             link.click();
//             document.body.removeChild(link);
//         }
//     }
// }

function createVideoIndex(liveVideos) {
    const infoPopup = document.getElementById('index-text');
    liveVideos.forEach((video, index) => {
        infoPopup.innerHTML += `<div>${index + 1}. <a href="https://www.youtube.com/watch?v=${video["videoID"]}" target="_blank">${video["videoTitle"]}</a>,   <span style="font-style: italic;">${video["videoChannelName"]}</span>.</div> `;
    });
}

window.addEventListener('load', async () => {
    const lastUpdate = localStorage.getItem('videodatasetTimestamp');
    const cachedLiveVideos = localStorage.getItem('videodataset');
    // Check if the cached data exists and whether it was updated within the last 12 hours
    const isUpToDate = cachedLiveVideos && lastUpdate && (Date.now() - lastUpdate < 43200000); // 12 hours in milliseconds
    if (isUpToDate) {
        console.log("Using cached live videos data");
        const liveVideos = JSON.parse(cachedLiveVideos);
        createVideoIndex(liveVideos);
        loadInitialVideos(liveVideos);
    } else {
        try {
            for (const channelId of CHANNEL_IDS.slice(0,20)) {
                const liveVideosFromChannel = await fetchLiveVideos(channelId);
                if (liveVideosFromChannel.length !== 0) {
                    await getFullVideoInfo(liveVideosFromChannel);
                }
            }
            console.log("FULL LIVE VIDEOS INFO: ", liveVideos);
            localStorage.setItem('videodataset', JSON.stringify(liveVideos));
            localStorage.setItem('videodatasetTimestamp', Date.now()); // Update the timestamp
            createVideoIndex(liveVideos);
            loadInitialVideos(liveVideos);
        } catch (error) {
            console.error('Error initializing:', error);
        }
    }
});




// const fetch = require('node-fetch');
// const { createClient } = require('redis');
// const { saveAs } = require('file-saver');
// const redisClient = createClient();

// // Define the column names and initialize the CSV content
// const columns = ["videoID", "videoTitle", "videoChannelName", "videoDescription", "iframeVideoSrc", "locationName", "locationAddress", "location_X_coor", "location_Y_coor"];
// let csvContent = columns.join(",") + "\n";

// const API_KEY = 'AIzaSyD1QY3irUe8pH30habeDUhLKZ-5VlcPyr8';
// const CHANNEL_IDS = ['UCsFgbVuhRrPV5FqyN7kOD8g', 'UCRPhYF9rd5ov7DNKj99MNIg', 'UC3DWrk_z1sH3ix1QNQTFr7w', 'UC-2KSeUU5SMCX6XLRD-AEvw', 'UCSyg9cb3Iq-NtlbxqNB9wGw', 'UCRPhYF9rd5ov7DNKj99MNIg', 'UCtllXAWa3EcfcsL5tvpqGSw', 'UCbzl-qtfTKY9QNgtnqmuyBw', 'UCUtGnX65osNPQ98Y3-SSgpg', 'UCaLACDf5aXquc4-i89vfyqg', 'UCarKzF2g4RXDOZLy-VBd_MA', 'UCnM5iMGiKsZg-iOlIO2ZkdQ', 'UC2Sk0aXLq3ADkH_USGPKT_Q', 'UCl-QNzkm3zAmoCqedCL1EPQ', 'UC9X6gGKDv2yhMoofoeS7-Gg'];
// // Number of livestreams you want to display
// const MAX_RESULTS = 100;

// const iframeVideoOne = document.getElementById('video-1');
// const iframeVideoTwo = document.getElementById('video-2');
// const iframeVideoThree = document.getElementById('video-3');
// const iframeVideoFour = document.getElementById('video-4');
// const videoOneCoord = document.getElementById('video-1-location-coord');
// const videOneAddr = document.getElementById('video-1-location-address');
// const videoTwoCoord = document.getElementById('video-2-location-coord');
// const videoTwoAddr = document.getElementById('video-2-location-address');
// const videoThreeCoord = document.getElementById('video-3-location-coord');
// const videoThreeAddr = document.getElementById('video-3-location-address');
// const videoFourCoord = document.getElementById('video-4-location-coord');
// const videoFourAddr = document.getElementById('video-4-location-address');
// const liveVideos = [];

// async function callPythonFunction(param) {
//     try {
//         const response = await fetch('/callPythonFunction', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json'
//             },
//             body: JSON.stringify({
//                 functionName: 'find_naturecam_locations',
//                 param: param
//             })
//         });

//         if (!response.ok) {
//             throw new Error('Network response was not ok');
//         }
//         const data = await response.json();
//         return data.result;
//     } catch (error) {
//         console.error('Error calling Python function:', error);
//         throw error; // rethrow the error if needed
//     }
// }

// async function fetchLiveVideos(channelId) {
//     const cacheKey = `live_videos_${channelId}`;

//     return new Promise((resolve, reject) => {
//         redisClient.get(cacheKey, async (err, cachedData) => {
//             if (err) {
//                 console.error('Error retrieving from cache:', err);
//                 return reject(err);
//             }

//             if (cachedData) {
//                 console.log(`Cache hit for channel ${channelId}`);
//                 return resolve(JSON.parse(cachedData));
//             } else {
//                 console.log(`Cache miss for channel ${channelId}`);
//                 try {
//                     const response = await fetch(`https://www.googleapis.com/youtube/v3/search?key=${API_KEY}&channelId=${channelId}&part=snippet,status&type=video&eventType=live&order=viewCount&maxResults=${MAX_RESULTS}`);
//                     const data = await response.json();

//                     if (data.items) {
//                         redisClient.setex(cacheKey, cacheExpiration, JSON.stringify(data.items));
//                         return resolve(data.items);
//                     } else {
//                         return reject(new Error('No live videos found'));
//                     }
//                 } catch (error) {
//                     console.error('Error fetching live videos:', error);
//                     return reject(error);
//                 }
//             }
//         });
//     });
// }

// async function loadInitialVideos() {
//     const initialVideos = liveVideos.slice(0, 4);
//     for (let i = 0; i < initialVideos.length; i++) {
//         const each_video = initialVideos[i];
//         const titleString = each_video.videoTitle;
//         const descriptionString = each_video.videoDescription;

//         try {
//             const result = await callPythonFunction([titleString, descriptionString]);
//             const modified_result = result.replace(/'/g, '"');
//             const jsonresult = JSON.parse(modified_result);

//             each_video.locationName = jsonresult['location-name'];
//             each_video.locationAddress = jsonresult['location-address'];
//             each_video.locationXcoor = jsonresult['location-x-coor'];
//             each_video.locationYcoor = jsonresult['location-y-coor'];

//             const row = columns.map(column => `"${each_video[column] || ''}"`).join(',') + '\n';
//             csvContent += row;
//         } catch (error) {
//             console.error('Error calling Python function:', error);
//         }
//     }

//     videoOneCoord.innerText = `(${liveVideos[v_1].locationXcoor} , ${liveVideos[v_1].locationYcoor})`;
//     videOneAddr.innerText = `${liveVideos[v_1].locationAddress}`;
//     videoTwoCoord.innerText = `(${liveVideos[v_2].locationXcoor} , ${liveVideos[v_2].locationYcoor})`;
//     videoTwoAddr.innerText = `${liveVideos[v_2].locationAddress}`;
//     videoThreeCoord.innerText = `(${liveVideos[v_3].locationXcoor} , ${liveVideos[v_3].locationYcoor})`;
//     videoThreeAddr.innerText = `${liveVideos[v_3].locationAddress}`;
//     videoFourCoord.innerText = `(${liveVideos[v_4].locationXcoor} , ${liveVideos[v_4].locationYcoor})`;
//     videoFourAddr.innerText = `${liveVideos[v_4].locationAddress}`;

//     getLocations(); 
// }

// function shuffleVideos() {
//     const displayVideoInfo = [];
//     let result = new Set(); // Use a Set to ensure uniqueness
//     while (result.size < 4) {
//         const randomInt = Math.floor(Math.random() * (liveVideos.length)); // Generate random integer from 0 to x
//         result.add(randomInt);
//     }
//     const fourVideos = Array.from(result); // Convert the Set to an array and return
//     iframeVideoOne.src = liveVideos[fourVideos[0]].iframeVideoSrc;
//     iframeVideoTwo.src = liveVideos[fourVideos[1]].iframeVideoSrc;
//     iframeVideoThree.src = liveVideos[fourVideos[2]].iframeVideoSrc;
//     iframeVideoFour.src = liveVideos[fourVideos[3]].iframeVideoSrc;

//     displayVideoInfo.push(liveVideos[fourVideos[0]]);
//     displayVideoInfo.push(liveVideos[fourVideos[1]]);
//     displayVideoInfo.push(liveVideos[fourVideos[2]]);
//     displayVideoInfo.push(liveVideos[fourVideos[3]]);

//     videoOneCoord.innerText = `(${liveVideos[fourVideos[0]].locationXcoor} , ${liveVideos[fourVideos[0]].locationYcoor})`;
//     videOneAddr.innerText = `${liveVideos[fourVideos[0]].locationAddress}`;
//     videoTwoCoord.innerText = `(${liveVideos[fourVideos[1]].locationXcoor} , ${liveVideos[fourVideos[1]].locationYcoor})`;
//     videoTwoAddr.innerText = `${liveVideos[fourVideos[1]].locationAddress}`;
//     videoThreeCoord.innerText = `(${liveVideos[fourVideos[2]].locationXcoor} , ${liveVideos[fourVideos[2]].locationYcoor})`;
//     videoThreeAddr.innerText = `${liveVideos[fourVideos[2]].locationAddress}`;
//     videoFourCoord.innerText = `(${liveVideos[fourVideos[3]].locationXcoor} , ${liveVideos[fourVideos[3]].locationYcoor})`;
//     videoFourAddr.innerText = `${liveVideos[fourVideos[3]].locationAddress}`;

//     getLocations();
//     return displayVideoInfo;
// }

// // Function to download the CSV
// function downloadCSV(content, filename) {
//     const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
//     saveAs(blob, filename);
// }

// async function init() {
//     try {
//         await redisClient.connect();
//         for (const channelId of CHANNEL_IDS) {
//             const liveVideosFromChannel = await fetchLiveVideos(channelId);
//             liveVideos.push(...liveVideosFromChannel.map(video => ({
//                 videoID: video.id.videoId,
//                 videoTitle: video.snippet.title,
//                 videoChannelName: video.snippet.channelTitle,
//                 videoDescription: video.snippet.description,
//                 iframeVideoSrc: `https://www.youtube.com/embed/${video.id.videoId}`,
//             })));
//         }

//         loadInitialVideos();
//     } catch (error) {
//         console.error('Error initializing:', error);
//     } finally {
//         await redisClient.disconnect();
//     }
// }

// init();
