/* ===== GESTION AUDIO SÉCURISÉE ===== */
function playSound(elementId, volume = 0.5) {
    const sound = document.getElementById(elementId);
    if (sound) {
        sound.volume = volume;
        // On remet à zéro pour pouvoir rejouer le son rapidement (cliquetis)
        sound.currentTime = 0; 
        sound.play().catch(e => {
            // Erreur silencieuse si le navigateur bloque encore
            console.log("Audio en attente d'interaction");
        });
    }
}

function stopSound(elementId) {
    const sound = document.getElementById(elementId);
    if (sound) sound.pause();
}

/* ===== NAVIGATION ===== */
function goAuth() {
    window.location.href = "auth.html";
}

function goHome() {
    document.body.classList.add("fade-out");
    setTimeout(() => {
        window.location.href = "home.html";
    }, 800);
}

/* ===== GESTION AUDIO ===== */
const typingSound = document.getElementById("typingSound");
const successSound = document.getElementById("successSound");

if (typingSound) typingSound.volume = 0.4;

function playTyping() {
    if (typingSound) {
        typingSound.currentTime = 0;
        typingSound.play().catch(() => {});
    }
}

function stopTyping() {
    if (typingSound) {
        typingSound.pause();
    }
}

/* ===== LOGIQUE DU TERMINAL ===== */
document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById("terminal")) {
        startTerminal();
    }

    // Gestion du menu sur home.html
    const menuItems = document.querySelectorAll(".menu-item");
    menuItems.forEach(item => {
        item.addEventListener("click", () => {
            const pageId = item.getAttribute("data-page");
            
            // UI Update
            menuItems.forEach(i => i.classList.remove("active", "bg-[#0a3cff]/20"));
            item.classList.add("active", "bg-[#0a3cff]/20");

            // Page Switch
            document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
            const target = document.getElementById(pageId);
            if(target) target.classList.add("active");
        });
    });
});

function startTerminal() {
    const lines = [
        "NBN_NETWORK_OS v4.0...",
        "> Initialisation des protocoles",
        "> Scan biométrique en cours...",
        "> Analyse des données : 100%",
        "> ACCÈS AUTORISÉ AU HUB",
        "> Bienvenue dans la Nation."
    ];

    const terminal = document.getElementById("terminal");
    const scanner = document.getElementById("scanner");
    let lineIdx = 0;

    function typeLine() {
        if (lineIdx < lines.length) {
            let div = document.createElement("div");
            div.className = "mb-1 text-[#00ff00]";
            terminal.appendChild(div);
            
            let charIdx = 0;
            let currentText = lines[lineIdx];

            // Effet visuel sur le scanner durant l'analyse
            if (currentText.includes("Analyse")) scanner.classList.add("glitch");

            // Démarrage du son de clavier
            playTyping();

            let charInterval = setInterval(() => {
                div.textContent += currentText[charIdx];
                charIdx++;

                if (charIdx >= currentText.length) {
                    clearInterval(charInterval);
                    stopTyping(); // On arrête le son à la fin de la ligne

                    if (currentText.includes("ACCÈS")) {
                        scanner.classList.remove("glitch");
                        scanner.classList.add("border-blue-600");
                    }
                    
                    lineIdx++;
                    setTimeout(typeLine, 600); // Pause entre les lignes
                }
            }, 50); // Vitesse des lettres
        } else {
            // Affichage final
            document.getElementById("accessBtn").classList.remove("hidden");
            document.getElementById("welcomeMsg").classList.remove("hidden");
            if (successSound) successSound.play().catch(() => {});
        }
    }

    setTimeout(typeLine, 1000); // Délai avant le début
}

/* ===== GESTION MUSIQUE HOME (AUTO & VOLUME) ===== */
const homeMusic = document.getElementById("homeMusic");
const musicIcon = document.getElementById("musicIcon");
const volumeSlider = document.getElementById("volumeSlider");

// 1. Fonction pour basculer le son (Play/Pause)
function toggleMusic() {
    if (!homeMusic) return;
    
    if (homeMusic.paused) {
        homeMusic.play().catch(e => console.log("Attente d'interaction..."));
        musicIcon.textContent = "🔊";
    } else {
        homeMusic.pause();
        musicIcon.textContent = "🔈";
    }
}

// 2. Gestion du volume via le slider
if (volumeSlider && homeMusic) {
    volumeSlider.addEventListener('input', (e) => {
        const volume = e.target.value;
        homeMusic.volume = volume;
    });
}

// 3. Lancement AUTOMATIQUE au chargement
// Grâce au clic sur la page précédente (auth.html), le navigateur autorisera le son.
window.addEventListener('load', () => {
    if (homeMusic) {
        // On essaie de jouer la musique immédiatement
        const playPromise = homeMusic.play();

        if (playPromise !== undefined) {
            playPromise.then(() => {
                // Lecture réussie
                musicIcon.textContent = "🔊";
            }).catch(error => {
                // Si le navigateur bloque encore, on attend le premier clic sur la page
                console.log("Autoplay bloqué, lecture au premier clic.");
                musicIcon.textContent = "🔈";
                
                // Sécurité : si l'utilisateur clique n'importe où, on lance la musique
                document.addEventListener('click', () => {
                    if (homeMusic.paused) {
                        homeMusic.play();
                        musicIcon.textContent = "🔊";
                    }
                }, { once: true });
            });
        }
    }
});

function toggleMusic() {
    if (homeMusic.paused) {
        homeMusic.play().catch(e => console.log("Lecture bloquée par le navigateur"));
        musicIcon.textContent = "🔊";
        musicIcon.classList.add("animate-pulse"); // Petit effet visuel
    } else {
        homeMusic.pause();
        musicIcon.textContent = "🔈";
        musicIcon.classList.remove("animate-pulse");
    }
}

// Optionnel : Lancer la musique automatiquement après le premier clic sur la page
document.addEventListener('click', function() {
    if (homeMusic && homeMusic.paused && !homeMusic.getAttribute('data-manual-stop')) {
        homeMusic.play().catch(() => {});
        if(musicIcon) musicIcon.textContent = "🔊";
    }
}, { once: true });

/* ===== LOGIQUE CARTE INTERACTIVE ===== */
document.addEventListener("DOMContentLoaded", () => {
    const mapWrapper = document.getElementById("gtaMap");
    const mapContainer = document.querySelector(".map-container");

    if (!mapWrapper || !mapContainer) return;

    let scale = 1;
    let isDragging = false;
    let startX, startY, posX = 0, posY = 0;

    // Déplacement (Drag)
    mapContainer.addEventListener("mousedown", (e) => {
        isDragging = true;
        startX = e.clientX - posX;
        startY = e.clientY - posY;
        mapContainer.style.cursor = "grabbing";
    });

    window.addEventListener("mouseup", () => {
        isDragging = false;
        mapContainer.style.cursor = "grab";
    });

    window.addEventListener("mousemove", (e) => {
        if (!isDragging) return;
        posX = e.clientX - startX;
        posY = e.clientY - startY;
        mapWrapper.style.transform = `translate(${posX}px, ${posY}px) scale(${scale})`;
    });

    // Zoom (Molette)
    mapContainer.addEventListener("wheel", (e) => {
        e.preventDefault();
        const delta = e.deltaY * -0.001;
        const newScale = Math.min(Math.max(0.5, scale + delta), 4);
        scale = newScale;
        mapWrapper.style.transform = `translate(${posX}px, ${posY}px) scale(${scale})`;
    }, { passive: false });

    // Clic sur les points
    document.querySelectorAll(".map-point").forEach(point => {
        point.addEventListener("click", (e) => {
            e.stopPropagation(); // Empêche de déplacer la carte en cliquant
            const popup = document.getElementById("mapPopup");
            document.getElementById("popupTitle").textContent = point.dataset.name;
            document.getElementById("popupDesc").textContent = point.dataset.desc;
            popup.style.display = "block";
        });
    });
});

/* ===== ANIMATION MACHINE A ECRIRE HISTOIRE ===== */

function startStoryTyping() {
    const container = document.getElementById("storyContainer");
    if (!container) return;

    const text = container.innerText;
    container.innerText = "";

    let i = 0;

    function type() {
        if (i < text.length) {
            container.innerText += text.charAt(i);
            i++;
            setTimeout(type, 15);
        }
    }

    type();
}
/* ===== ANIMATION HISTOIRE TYPEWRITER ===== */
function animateHistory() {
    const texts = document.querySelectorAll('.story-text');
    
    texts.forEach((el) => {
        const content = el.innerHTML;
        el.innerHTML = ''; // On vide pour l'effet
        el.style.opacity = "1";
        
        let i = 0;
        const speed = 15; // Vitesse d'écriture (ms)
        
        // Petit délai avant de commencer chaque paragraphe
        setTimeout(() => {
            const timer = setInterval(() => {
                if (i < content.length) {
                    // Si on rencontre un tag HTML (ex: <span...>), on l'affiche d'un coup
                    if (content[i] === '<') {
                        let endTag = content.indexOf('>', i);
                        el.innerHTML += content.substring(i, endTag + 1);
                        i = endTag + 1;
                    } else {
                        el.innerHTML += content.charAt(i);
                        i++;
                    }
                } else {
                    clearInterval(timer);
                }
            }, speed);
        }, el.getAttribute('data-delay') || 0);
    });
}

// Modifier la navigation existante pour déclencher l'anim
document.addEventListener('DOMContentLoaded', () => {
    const historyBtn = document.querySelector('[data-page="histoire"]');
    if(historyBtn) {
        historyBtn.addEventListener('click', () => {
            // Un petit délai pour laisser la page s'afficher
            setTimeout(animateHistory, 300);
        });
    }
});

function animateMembers() {
    const cards = document.querySelectorAll('.member-card');
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(10px)';
        setTimeout(() => {
            card.style.transition = 'all 0.4s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 100); // 100ms de décalage entre chaque membre
    });
}

// Déclencher l'animation au clic sur l'onglet INFO
document.addEventListener('DOMContentLoaded', () => {
    const infoBtn = document.querySelector('[data-page="info"]');
    if(infoBtn) {
        infoBtn.addEventListener('click', animateMembers);
    }
});