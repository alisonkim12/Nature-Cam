const soundButton = document.getElementById('sound-button');
const indexButton = document.getElementById('index-button');
const overlay = document.getElementById('overlay');
const closeButton = document.getElementById('close-button');
const mapButton = document.getElementById("map-button");
const infoButton = document.getElementById('info-button');
const infoPopup = document.getElementById('info-popup');
const loadingMessage = document.getElementById('loading-text');
let players = [];
let soundOn = true;

// function muteAllVideos() {
//     const iframes = document.querySelectorAll('iframe');
//     iframes.forEach((iframe) => {
//         // Check if the iframe is a YouTube embed
//         const src = iframe.src;
//         if (src && src.includes('youtube.com/embed')) {
//             // Add or update the mute parameter in the src URL
//             if (!src.includes('mute=1')) {
//             if (src.includes('?')) {
//                 iframe.src = `${src}&mute=1`;
//             } else {
//                 iframe.src = `${src}?mute=1`;
//             }
//             }
//     }
//     });
// }

// function unmuteAllVideos() {
//     const iframes = document.querySelectorAll('iframe');
//     iframes.forEach((iframe) => {
//     // Check if the iframe is a YouTube embed
//     const src = iframe.src;
//     if (src && src.includes('youtube.com/embed')) {
//         // Remove the mute parameter from the src URL
//         if (src.includes('mute=1')) {
//         // Create a new URL object to easily manipulate query parameters
//         const url = new URL(src);
//         // Remove the mute parameter
//         url.searchParams.delete('mute');
//         // Update the iframe src
//         iframe.src = url.toString();
//         }
//     }
//     });
    
// }


function loadingMessageAnimation() {
    let dots = 0;
    const maxDots = 3;

    setInterval(() => {
        loadingMessage.textContent = `videos loading${'.'.repeat(dots)}`;
        dots = (dots + 1) % (maxDots + 1);
    }, 500); 

}

loadingMessageAnimation();


// Function to mute all players
function muteAllVideos() {
    // console.log(players);
    // players.forEach(player => {
    //     player.mute();
    // });
    players.forEach(player => {
        if (player && typeof player.mute === 'function') {
            player.mute();
        } else {
            console.error("Player is not valid:", player);
        }
    });
  }
  

// Function to unmute all players
function unmuteAllVideos() {
    players.forEach(player => {
        player.unMute();
    });
}

function onYouTubeIframeAPIReady() {
    const iframes = document.querySelectorAll('iframe');
    iframes.forEach((iframe) => {
        // Check if the iframe is a YouTube embed
        const src = iframe.src;
        if (src && src.includes('youtube.com/embed')) {
            // Create a new YouTube player instance
            const player = new YT.Player(iframe, {
                events: {
                }
            });
            players.push(player);
        }
    });
    console.log("players", players);
    muteVideos();
}

function checkForIframes() {
    const iframes = document.querySelectorAll('iframe');
    const youtubeIframes = Array.from(iframes).filter(iframe => iframe.src && iframe.src.includes('youtube.com/embed'));
    if (youtubeIframes.length > 0) {
        onYouTubeIframeAPIReady();
        clearInterval(iframeChecker);
    }
}

const iframeChecker = setInterval(checkForIframes, 1000);

function muteVideos() {
    soundButton.addEventListener('click', () => {
        console.log("sound button clicked");
        soundOn = !soundOn; 
        if (soundOn != true) {
            soundButton.querySelector('a').textContent = '[ 🔇 ]';
            muteAllVideos();
        } else {
            soundButton.querySelector('a').textContent = '[ 🔉 ]';
            unmuteAllVideos();
    
        }
    });
}


soundButton.addEventListener('mouseover', () => {
    if (soundOn == true){
        soundButton.querySelector('a').textContent = '[ 🔇 ]';
    }
});

soundButton.addEventListener('mouseout', () => {
    if (soundOn == true){
        soundButton.querySelector('a').textContent = '[ 🔉 ]';
    }
});

indexButton.addEventListener('mouseover', () => {
    indexButton.querySelector('a').textContent = 'index';
});

indexButton.addEventListener('mouseout', () => {
    indexButton.querySelector('a').textContent = '[ 🌱 ]';
});

infoButton.addEventListener('mouseover', () => {
    infoButton.textContent = 'info';
    infoPopup.style.display = 'block';
});

infoButton.addEventListener('mouseout', () => {
    infoButton.innerHTML = '<i style = "font-size: 25px;"class="ri-information-2-line"></i>';
    infoPopup.style.display = 'none';
});

indexButton.addEventListener('click', async function() {
    overlay.classList.add('blur'); 
    overlay.style.display = 'block';
});

// Add event listener to close button
closeButton.addEventListener('click', function() {
    overlay.classList.remove('blur');
    overlay.style.display = 'none';
});

mapButton.addEventListener("mouseover", function() {
    mapButton.querySelector('a').textContent = 'm a p';
});

mapButton.addEventListener("mouseout", function() {
    mapButton.querySelector('a').textContent = '[ 📍 ]';
});

mapButton.addEventListener("click", function() {
    window.location.href = "map.html";
});
