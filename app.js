import { db } from './firebase-config.js';
import { doc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { isNameBlocked } from './blocklist.js';

emailjs.init({
    publicKey: "service_cn3re1k"
});

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
            const templateParams = {
                to_email: captainEmail,
                to_name: captainName,
                team_name: teamNameInput,
                game_name: gameInput,
                p1_name: document.getElementById('pName_1').value,
                p1_class: document.getElementById('pClass_1').value,
                p2_name: document.getElementById('pName_2').value,
                p2_class: document.getElementById('pClass_2').value,
                p3_name: document.getElementById('pName_3').value,
                p3_class: document.getElementById('pClass_3').value,
                p4_name: document.getElementById('pName_4').value,
                p4_class: document.getElementById('pClass_4').value,
                p5_name: document.getElementById('pName_5').value,
                p5_class: document.getElementById('pClass_5').value
            };
            
            await emailjs.send('IDE_JON_A_SERVICE_ID', 'IDE_JON_A_TEMPLATE_ID', templateParams);
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
