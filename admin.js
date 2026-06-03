import { db, auth } from './firebase-config.js';
import { signInWithEmailAndPassword, onAuthStateChanged, signOut, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { collection, getDocs, query, orderBy, doc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const loginBox = document.getElementById('loginBox');
const dashBox = document.getElementById('dashBox');
const dataList = document.getElementById('dataList');
const adminForm = document.getElementById('adminForm');
const loginStatus = document.getElementById('loginStatus');
const emailModal = document.getElementById('emailModal');
const modalEmailText = document.getElementById('modalEmailText');
const modalCloseBtn = document.getElementById('modalCloseBtn');
const profileBtn = document.getElementById('profileBtn');
const profileModal = document.getElementById('profileModal');
const closeProfileBtn = document.getElementById('closeProfileBtn');
const resetPasswordBtn = document.getElementById('resetPasswordBtn');
const profileEmailText = document.getElementById('profileEmailText');
const profileStatusMsg = document.getElementById('profileStatusMsg');

adminForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    loginStatus.innerText = "";
    const email = document.getElementById('aEmail').value;
    const pass = document.getElementById('aPass').value;

    try {
        await signInWithEmailAndPassword(auth, email, pass);
    } catch (err) {
        loginStatus.innerText = "Érvénytelen belépési adatok!";
    }
});

document.getElementById('logoutBtn').addEventListener('click', () => {
    signOut(auth);
});

modalCloseBtn.addEventListener('click', () => {
    emailModal.classList.add('hidden');
});

profileBtn.addEventListener('click', () => {
    if (auth.currentUser) {
        profileEmailText.innerText = auth.currentUser.email;
        profileStatusMsg.innerText = "";
        profileStatusMsg.className = "status-msg";
        profileModal.classList.remove('hidden');
    }
});

closeProfileBtn.addEventListener('click', () => {
    profileModal.classList.add('hidden');
});

resetPasswordBtn.addEventListener('click', async () => {
    if (!auth.currentUser) return;
    
    resetPasswordBtn.disabled = true;
    profileStatusMsg.innerText = "Feldolgozás...";
    profileStatusMsg.className = "status-msg";
    
    try {
        await sendPasswordResetEmail(auth, auth.currentUser.email);
        profileStatusMsg.className = "status-msg success";
        profileStatusMsg.innerText = "Email elküldve a postafiókodba!";
    } catch (err) {
        profileStatusMsg.className = "status-msg error";
        profileStatusMsg.innerText = "Hiba történt az email küldésekor.";
    } finally {
        resetPasswordBtn.disabled = false;
    }
});

onAuthStateChanged(auth, user => {
    if (user) {
        loginBox.classList.add('hidden');
        dashBox.classList.remove('hidden');
        fetchData();
    } else {
        loginBox.classList.remove('hidden');
        dashBox.classList.add('hidden');
        dataList.innerHTML = '';
        adminForm.reset();
        profileModal.classList.add('hidden');
    }
});

async function fetchData() {
    dataList.innerHTML = '<div class="text-center">Adatok szinkronizálása...</div>';
    try {
        const q = query(collection(db, "registrations"), orderBy("timestamp", "desc"));
        const snap = await getDocs(q);
        dataList.innerHTML = '';
        
        if(snap.empty) {
            dataList.innerHTML = '<div class="text-center">Még nincs jelentkező.</div>';
            return;
        }

        snap.forEach((documentSnapshot) => {
            const d = documentSnapshot.data();
            const docId = documentSnapshot.id;
            const p = d.players || [];
            let rows = '';
            
            p.forEach((player, idx) => {
                const c = idx === 0 ? 'class="captain-row"' : '';
                const r = idx === 0 ? '(C)' : '';
                const ingameName = player.ingame || '-';
                
                rows += `
                    <tr ${c}>
                        <td>${idx + 1}</td>
                        <td>${player.name} ${r}</td>
                        <td>${player.className}</td>
                        <td>${ingameName}</td>
                    </tr>
                `;
            });

            let tStr = "-";
            if(d.timestamp) {
                tStr = d.timestamp.toDate().toLocaleString('hu-HU');
            }

            const captainEmail = p[0] && p[0].email ? p[0].email : 'Nincs megadva';

            const card = document.createElement('div');
            card.className = 'admin-team-card';
            card.innerHTML = `
                <div class="admin-team-header">
                    <h3><span class="clickable-team" data-email="${captainEmail}">${d.teamName}</span> <span class="date-tag">${tStr}</span></h3>
                    <div class="header-controls">
                        <span class="game-tag">${d.game}</span>
                        <button class="btn-delete" data-id="${docId}">Törlés</button>
                    </div>
                </div>
                <table class="admin-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Név</th>
                            <th>Osztály</th>
                            <th>In-Game Név</th>
                        </tr>
                    </thead>
                    <tbody>${rows}</tbody>
                </table>
            `;
            dataList.appendChild(card);
        });

        document.querySelectorAll('.clickable-team').forEach(element => {
            element.addEventListener('click', (e) => {
                modalEmailText.innerText = e.target.getAttribute('data-email');
                emailModal.classList.remove('hidden');
            });
        });

        document.querySelectorAll('.btn-delete').forEach(button => {
            button.addEventListener('click', async (e) => {
                if(confirm("Biztosan törölni szeretnéd ezt a jelentkezést?")) {
                    const id = e.target.getAttribute('data-id');
                    try {
                        await deleteDoc(doc(db, "registrations", id));
                        fetchData();
                    } catch (error) {
                        alert("Hiba történt a törlés során!");
                    }
                }
            });
        });

    } catch (err) {
        dataList.innerHTML = '<div class="status-msg error">Adatbázis hiba történt.</div>';
    }
}
