// Player Elements (Existing variables)
const audioPlayer = document.getElementById('audio-player');
const playPauseBtn = document.getElementById('play-pause-btn');
const playIcon = document.getElementById('play-icon');
const pauseIcon = document.getElementById('pause-icon');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const coverImg = document.getElementById('cover-img');
const songTitle = document.getElementById('song-title');
const songArtist = document.getElementById('song-artist');
const progressBar = document.getElementById('progress-bar');
const progressContainer = document.getElementById('progress-container');
const currentTimeEl = document.getElementById('current-time');
const durationEl = document.getElementById('duration');
const downloadLink = document.getElementById('download-link');
const playerPanel = document.getElementById('player-panel');
const songListContainer = document.getElementById('song-list-container');
const searchInput = document.getElementById('search-input');
const loadingMessage = document.getElementById('loading-message');

// --- NEW MOBILE MENU ELEMENTS ---
const menuToggle = document.getElementById('menu-toggle');
const mobileMenu = document.getElementById('mobile-menu');
const openIcon = document.getElementById('open-icon');
const closeIcon = document.getElementById('close-icon');

// Song Data and State
let songs = [];
let songIndex = 0;
let isPlaying = false;
const defaultCover = 'https://raw.githubusercontent.com/rasara4/dp-project-1/refs/heads/rasara4-patch-1/images/1762925816965.jpg';

// --- UTILITY FUNCTIONS ---
function formatTime(seconds) {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
}

function slugify(text) {
    return text.toString().toLowerCase()
        .replace(/\s+/g, '-')           
        .replace(/[^\w\-]+/g, '')       
        .replace(/\-\-+/g, '-')         
        .replace(/^-+/, '')             
        .replace(/-+$/, '');            
}

// --- CORE PLAYER LOGIC ---
function playSong() {
    isPlaying = true;
    playIcon.classList.add('hidden');
    pauseIcon.classList.remove('hidden');
    coverImg.classList.add('rotating');
    playerPanel.classList.remove('translate-y-full'); 
    audioPlayer.play();
}

function pauseSong() {
    isPlaying = false;
    playIcon.classList.remove('hidden');
    pauseIcon.classList.add('hidden');
    coverImg.classList.remove('rotating');
    audioPlayer.pause();
}

function updateActiveSongInList(activeSongId) {
    document.querySelectorAll('.song-list-item').forEach(item => {
        const itemSongId = item.getAttribute('data-song-id');
        
        // Remove active styles
        item.className = 'song-list-item flex items-center p-4 rounded-lg shadow-2xl cursor-pointer transition duration-300 ease-in-out bg-gray-800/80 border-l-4 border-transparent hover:bg-indigo-900/40 hover:border-indigo-700';
        item.classList.remove('active-song');

        if (itemSongId == activeSongId) {
            // Apply active styles
            item.className = 'song-list-item flex items-center p-4 rounded-lg shadow-2xl cursor-pointer transition duration-300 ease-in-out bg-indigo-900/60 border-l-4 border-indigo-500 transform scale-[1.01] active-song';
        }
    });
}

function loadSong(index) {
    const song = songs[index];
    if (!song) return;
    
    songIndex = index;
    songTitle.textContent = song.title;
    songArtist.textContent = song.artist;
    coverImg.src = song.cover_image || defaultCover;
    audioPlayer.src = song.song_url;
    downloadLink.href = song.download_url;
    
    progressBar.style.width = '0%';

    // URL Management
    const songSlug = slugify(song.title);
    const newUrl = `/song/${song.id}/${songSlug}`; 
    
    if (window.location.pathname !== newUrl) {
         window.history.pushState({ songId: song.id }, song.title, newUrl);
    }
    
    updateActiveSongInList(song.id); 
}


// --- LIST AND SEARCH MANAGEMENT ---
function renderSongList(filteredSongs) {
    songListContainer.innerHTML = '';
    if (filteredSongs.length === 0) {
        songListContainer.innerHTML = '<div class="text-gray-400 text-center py-10">No songs found matching your search.</div>';
        return;
    }

    filteredSongs.forEach((song) => {
        const originalIndex = songs.findIndex(s => s.id === song.id);
        const isActive = originalIndex === songIndex; 

        const songElement = document.createElement('div');
        songElement.className = `song-list-item flex items-center p-4 rounded-lg shadow-2xl cursor-pointer transition duration-300 ease-in-out ${
            isActive 
            ? 'bg-indigo-900/60 border-l-4 border-indigo-500 transform scale-[1.01] active-song' 
            : 'bg-gray-800/80 border-l-4 border-transparent hover:bg-indigo-900/40 hover:border-indigo-700'
        }`;
        songElement.setAttribute('data-song-id', song.id);

        songElement.innerHTML = `
            <img src="${song.cover_image || defaultCover}" alt="${song.title}" class="w-14 h-14 object-cover rounded-lg mr-4 shadow-lg ring-1 ring-indigo-500/50">
            <div class="flex-grow min-w-0">
                <p class="text-lg font-extrabold text-white truncate">${song.title}</p>
                <p class="text-sm text-indigo-400 font-medium">${song.artist}</p>
            </div>
            <button class="play-list-btn ml-auto p-2 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white transition transform hover:scale-110 shadow-md">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
            </button>
        `;
        
        const playSongFromList = (indexToPlay) => {
             loadSong(indexToPlay);
             playSong();
        };

        songElement.querySelector('.play-list-btn').addEventListener('click', (e) => {
             e.stopPropagation(); 
             if (originalIndex !== -1) playSongFromList(originalIndex);
        });
        
        songElement.addEventListener('click', () => {
             if (originalIndex !== -1) playSongFromList(originalIndex);
        });

        songListContainer.appendChild(songElement);
    });
}

function handleSearch() {
    const searchTerm = searchInput.value.toLowerCase();
    const filteredSongs = songs.filter(song => 
        song.title.toLowerCase().includes(searchTerm) || 
        song.artist.toLowerCase().includes(searchTerm)
    );
    renderSongList(filteredSongs);
}

// --- MOBILE MENU LOGIC ---
function toggleMobileMenu() {
    mobileMenu.classList.toggle('hidden');
    openIcon.classList.toggle('hidden');
    closeIcon.classList.toggle('hidden');
}

// --- COPYRIGHT MARQUEE LOGIC ---
function updateCopyright() {
    const currentYear = new Date().getFullYear();
    const copyrightString = `Copyright © ${currentYear} | Nidahas Media OFC | Made By A.M.Ransara Devnath`;
    
    const copyrightEl = document.getElementById('copyright-text');
    const copyrightElClone = document.getElementById('copyright-text-clone');

    if (copyrightEl && copyrightElClone) {
        copyrightEl.textContent = copyrightString;
        copyrightElClone.textContent = copyrightString; 
    }
}


// --- INITIALIZATION ---
async function fetchSongs() {
    try {
        const response = await fetch('songs.json');
        songs = await response.json();
        loadingMessage.classList.add('hidden'); 
        
        renderSongList(songs);

        const pathParts = window.location.pathname.split('/');
        const songIdFromUrl = pathParts[2];
        
        if (songIdFromUrl) {
            const initialSongIndex = songs.findIndex(s => s.id == songIdFromUrl);
            if (initialSongIndex !== -1) {
                loadSong(initialSongIndex);
                updateActiveSongInList(songs[initialSongIndex].id); 
            }
        } else {
             if (songs.length > 0) {
                 loadSong(0); 
                 updateActiveSongInList(songs[0].id); 
             }
        }
    } catch (error) {
        loadingMessage.textContent = "Error loading data. Check songs.json file.";
        console.error("Error loading songs data:", error);
    }
}

// --- EVENT LISTENERS ---
playPauseBtn.addEventListener('click', () => (isPlaying ? pauseSong() : playSong()));
nextBtn.addEventListener('click', () => {
    songIndex = (songIndex + 1) % songs.length;
    loadSong(songIndex);
    playSong();
});
prevBtn.addEventListener('click', () => {
    songIndex = (songIndex - 1 + songs.length) % songs.length;
    loadSong(songIndex);
    playSong();
});

audioPlayer.addEventListener('timeupdate', (e) => {
    const { duration, currentTime } = e.srcElement;
    const progressPercent = (currentTime / duration) * 100;
    progressBar.style.width = `${progressPercent}%`;
    currentTimeEl.textContent = formatTime(currentTime);
});

audioPlayer.addEventListener('loadedmetadata', (e) => {
    durationEl.textContent = formatTime(audioPlayer.duration);
    playerPanel.classList.remove('translate-y-full'); 
});

audioPlayer.addEventListener('ended', () => {
    songIndex = (songIndex + 1) % songs.length;
    loadSong(songIndex);
    playSong();
});

progressContainer.addEventListener('click', (e) => {
    const width = progressContainer.clientWidth;
    const clickX = e.offsetX;
    const duration = audioPlayer.duration;
    audioPlayer.currentTime = (clickX / width) * duration;
});

searchInput.addEventListener('input', handleSearch);

window.addEventListener('popstate', (e) => {
    const pathParts = window.location.pathname.split('/');
    const songIdFromUrl = pathParts[2];
    
    if (songIdFromUrl && songs.length > 0) {
        const historySongIndex = songs.findIndex(s => s.id == songIdFromUrl);
        if (historySongIndex !== -1) {
            loadSong(historySongIndex);
        }
    }
});

// NEW MOBILE MENU EVENT LISTENER
menuToggle.addEventListener('click', toggleMobileMenu);


// Start the application
updateCopyright();
fetchSongs();
