import { db } from './firebase-config.js';
import { doc, setDoc, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { isNameBlocked } from './blocklist.js';

const regForm = document.getElementById('regForm');
const submitBtn = document.getElementById('submitBtn');
const statusMessage = document.getElementById('statusMessage');

regForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    submitBtn.disabled = true;
    submitBtn.innerText = "Feldolgozás...";
    statusMessage.className = "status-msg";
    statusMessage.innerText = "";

    const teamNameInput = document.getElementById('teamName').value.trim();
    const gameInput = document.getElementById('game').value;

    if (isNameBlocked(teamNameInput)) {
        statusMessage.className = "status-msg error";
        statusMessage.innerText = "Ez a csapatnév nem engedélyezett!";
        submitBtn.disabled = false;
        submitBtn.innerText = "Jelentkezés Leadása";
        return;
    }

    const teamData = {
        teamName: teamNameInput,
        game: gameInput,
        timestamp: serverTimestamp(),
        players: []
    };

    let captainEmail = "";
    let captainName = "";

    for (let i = 1; i <= 5; i++) {
        let playerData = {
            name: document.getElementById(`pName_${i}`).value,
            className: document.getElementById(`pClass_${i}`).value,
            ingame: document.getElementById(`pIngame_${i}`).value
        };
        
        if (i === 1) {
            playerData.email = document.getElementById('pEmail_1').value;
            captainEmail = playerData.email;
            captainName = playerData.name;
        }

        teamData.players.push(playerData);
    }

    const safeGame = gameInput.toLowerCase().replace(/[^a-z0-9]/g, '');
    const safeTeam = teamNameInput.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]/g, '');
    const customDocId = `${safeGame}_${safeTeam}`;

    try {
        await setDoc(doc(db, "registrations", customDocId), teamData);
        
        if (captainEmail) {
            await addDoc(collection(db, "mail"), {
                to: captainEmail,
                message: {
                    subject: "Sikeres E-Sport Jelentkezés!",
                    html: `
                        <div style="font-family: sans-serif; color: #1e1b4b;">
                            <h2>Szia ${captainName}!</h2>
                            <p>Sikeresen rögzítettük a jelentkezéseteket a bajnokságra!</p>
                            <p><strong>Csapatnév:</strong> ${teamNameInput}<br>
                            <strong>Választott játék:</strong> ${gameInput}</p>
                            <p>További információkkal hamarosan jelentkezünk.<br>
                            Sok sikert kívánunk a versenyen!</p>
                        </div>
                    `
                }
            });
        }
        
        document.querySelectorAll('.form-step').forEach(step => step.classList.remove('active'));
        document.querySelector('.form-step').classList.add('active');
        
        statusMessage.className = "status-msg success";
        statusMessage.innerText = "Sikeresen leadtad a jelentkezést!";
        regForm.reset();
    } catch (err) {
        if (err.code === 'permission-denied') {
            statusMessage.className = "status-msg error";
            statusMessage.innerText = "Ezzel a névvel már regisztráltak ebben a játékban!";
        } else {
            statusMessage.className = "status-msg error";
            statusMessage.innerText = "Hiba történt a szerverrel való kommunikációban.";
        }
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerText = "Jelentkezés Leadása";
    }
});
