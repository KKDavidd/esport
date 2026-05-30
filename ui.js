import { db } from './firebase-config.js';
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { isNameBlocked } from './blocklist.js';

const nextBtns = document.querySelectorAll('.btn-next');
const statusMessage = document.getElementById('statusMessage');
const regForm = document.getElementById('regForm');

regForm.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
    }
});

nextBtns.forEach(btn => {
    btn.addEventListener('click', async (e) => {
        e.preventDefault();

        const currentStep = e.target.closest('.form-step');
        const inputs = currentStep.querySelectorAll('input, select');
        let isValid = true;
        
        inputs.forEach(input => {
            if (!input.checkValidity()) {
                input.reportValidity();
                isValid = false;
            }
        });

        if (isValid && currentStep.querySelector('#teamName')) {
            const teamName = document.getElementById('teamName').value.trim();
            const game = document.getElementById('game').value;
            
            if (isNameBlocked(teamName)) {
                isValid = false;
                statusMessage.className = "status-msg error";
                statusMessage.innerText = "Ez a csapatnév nem engedélyezett!";
            } else {
                btn.disabled = true;
                const originalText = btn.innerText;
                btn.innerText = "Ellenőrzés...";
                
                const safeGame = game.toLowerCase().replace(/[^a-z0-9]/g, '');
                const safeTeam = teamName.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]/g, '');
                const customDocId = `${safeGame}_${safeTeam}`;

                try {
                    const docRef = doc(db, "registrations", customDocId);
                    const docSnap = await getDoc(docRef);
                    
                    if (docSnap.exists()) {
                        isValid = false;
                        statusMessage.className = "status-msg error";
                        statusMessage.innerText = "Ezzel a névvel már regisztráltak ebben a játékban!";
                    } else {
                        statusMessage.innerText = "";
                    }
                } catch (error) {
                    isValid = false;
                    statusMessage.className = "status-msg error";
                    statusMessage.innerText = "Hiba történt a név ellenőrzésekor.";
                } finally {
                    btn.disabled = false;
                    btn.innerText = originalText;
                }
            }
        } else if (isValid) {
            statusMessage.innerText = "";
        }

        if (isValid) {
            currentStep.classList.remove('active');
            if (currentStep.nextElementSibling) {
                currentStep.nextElementSibling.classList.add('active');
            }
        }
    });
});