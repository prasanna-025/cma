/* ========================================
   PlacementOS — sync.js
   Frictionless background syncing
======================================== */

const firebaseConfig = {
  apiKey: "AIzaSyDj7T1LxwCpDuCHSIAj5lli4Y_Y2f73j7A",
  authDomain: "placementos-prasanna.firebaseapp.com",
  projectId: "placementos-prasanna",
  storageBucket: "placementos-prasanna.firebasestorage.app",
  messagingSenderId: "913628894297",
  appId: "1:913628894297:web:ae140c0c5251ff4d170d48"
};

function normalizeSyncCode(code) {
  if (!code) return '';
  return code.trim()
             .toUpperCase()
             .replace(/O/g, '0')
             .replace(/I/g, '1')
             .replace(/L/g, '1');
}

let db = null;
let syncCode = localStorage.getItem('placementOS_sync_code');

if (syncCode) {
  syncCode = normalizeSyncCode(syncCode);
  localStorage.setItem('placementOS_sync_code', syncCode);
} else {
  syncCode = generateSyncCode();
  localStorage.setItem('placementOS_sync_code', syncCode);
}

// Initialize Firebase
if (typeof firebase !== 'undefined') {
  try {
    firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
    console.log("Firebase sync initialized with code:", syncCode);
    
    // Start initial pull
    window.addEventListener('DOMContentLoaded', () => {
      setTimeout(syncPull, 1000); // Pull 1s after load to not block UI
      renderSyncUI();
    });
  } catch (e) {
    console.error("Firebase initialization failed:", e);
  }
}

// Helper to generate a random code (excluding confusing characters)
function generateSyncCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'OS-';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Pull data from Firestore
function syncPull(isManual = false) {
  if (!db || !syncCode) {
    if (isManual && typeof toast === 'function') toast("⚠️ Sync offline: Firebase not initialized.", "error");
    return;
  }
  
  db.collection('sync_states').doc(syncCode).get().then(doc => {
    if (doc.exists) {
      const serverData = doc.data();
      const localSaved = localStorage.getItem('placementOS_v2');
      let localState = {};
      try {
        localState = localSaved ? JSON.parse(localSaved) : {};
      } catch (e) {}
      
      const serverUpdatedAt = serverData.updatedAt || 0;
      const localUpdatedAt = localState.updatedAt || 0;
      
      if (serverUpdatedAt > localUpdatedAt) {
        if (confirm("🔄 Cloud has newer progress. Sync and update this device?")) {
          console.log("Server data is newer. Syncing server data to local...");
          try {
            const parsedServer = JSON.parse(serverData.data);
            
            // Merge server data into local
            localStorage.setItem('placementOS_v2', serverData.data);
            
            if (typeof S !== 'undefined') {
              Object.assign(S, parsedServer);
            }
            
            alert("🔄 Sync complete! Page will reload to apply synced data.");
            location.reload();
          } catch (e) {
            console.error("Failed to parse server sync data:", e);
          }
        }
      } else if (localUpdatedAt > serverUpdatedAt) {
        console.log("Local data is newer. Pushing to server...");
        syncPush(localState);
        if (isManual && typeof toast === 'function') {
          toast("📤 Local progress pushed to cloud successfully!");
        }
      } else {
        if (isManual && typeof toast === 'function') {
          toast("✅ Already in sync with cloud!");
        }
      }
    } else {
      // First time sync for this code, push local data
      const localSaved = localStorage.getItem('placementOS_v2');
      if (localSaved) {
        try {
          syncPush(JSON.parse(localSaved));
          if (isManual && typeof toast === 'function') {
            toast("📤 Progress initialized & backed up to cloud!");
          }
        } catch (e) {}
      }
    }
  }).catch(err => {
    console.warn("Sync pull failed:", err);
    if (isManual && typeof toast === 'function') {
      toast("❌ Sync failed. Check internet connection.", "error");
    }
  });
}

// Push data to Firestore
function syncPush(state) {
  if (!db || !syncCode || !state) return;
  
  // Update state timestamp
  state.updatedAt = state.updatedAt || Date.now();
  
  const payload = {
    data: JSON.stringify(state),
    updatedAt: state.updatedAt
  };
  
  db.collection('sync_states').doc(syncCode).set(payload)
    .then(() => {
      console.log("Successfully pushed state to server sync ID:", syncCode);
    })
    .catch(err => {
      console.warn("Sync push failed (offline or permission issue):", err);
    });
}

// Change the sync code (link devices)
function changeSyncCode(newCode) {
  if (!newCode) return;
  newCode = normalizeSyncCode(newCode);
  if (newCode === syncCode) return;
  
  syncCode = newCode;
  localStorage.setItem('placementOS_sync_code', syncCode);
  
  // Pull the data immediately
  if (db) {
    db.collection('sync_states').doc(syncCode).get().then(doc => {
      if (doc.exists) {
        const serverData = doc.data();
        localStorage.setItem('placementOS_v2', serverData.data);
        location.reload();
      } else {
        // If no doc exists on server, push our current local data
        const localSaved = localStorage.getItem('placementOS_v2');
        if (localSaved) {
          try {
            syncPush(JSON.parse(localSaved));
            location.reload();
          } catch(e) {
            location.reload();
          }
        } else {
          location.reload();
        }
      }
    }).catch(() => {
      location.reload();
    });
  } else {
    location.reload();
  }
}

// Render the sync code in the UI
// Render the sync code in the UI
function renderSyncUI() {
  // Try to find a place to render the sync status (e.g. sidebar or footer)
  let sidebar = document.getElementById('sidebar');
  if (sidebar) {
    let syncPill = document.getElementById('sync-pill');
    if (!syncPill) {
      syncPill = document.createElement('div');
      syncPill.id = 'sync-pill';
      syncPill.style.cssText = 'padding: 12px 16px; margin: 16px 12px 0; background: rgba(108,99,255,0.08); border: 1px solid rgba(108,99,255,0.25); border-radius: 10px; font-size: 12px; color: var(--text2); display: flex; flex-direction: column; gap: 6px;';
      sidebar.appendChild(syncPill);
    }
    
    syncPill.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <span style="font-weight:600; font-size:11.5px; color:var(--accent);"><i class="fas fa-sync-alt"></i> Background Sync</span>
        <button onclick="promptSyncCode()" style="background:none; border:none; color:var(--accent2); font-weight:700; font-size:10.5px; cursor:pointer; padding:0;">Link Device</button>
      </div>
      <div style="font-size:10.5px; margin-top:2px;">Sync Code: <b style="color:var(--text); letter-spacing:0.5px;">${syncCode}</b></div>
      <button onclick="manualSyncTrigger()" style="margin-top:4px; width:100%; border:1px solid rgba(108,99,255,0.3); background:none; color:var(--text); font-size:10px; padding:5px; border-radius:5px; cursor:pointer; font-weight:600; display:flex; align-items:center; justify-content:center; gap:4px;"><i class="fas fa-sync"></i> Sync Now</button>
    `;
  }
}

function promptSyncCode() {
  const code = prompt("🔄 Link Devices:\nEnter the Sync Code from your laptop or mobile to link progress. (Case insensitive)\n\nCurrent Sync Code:", syncCode);
  if (code && code.trim() !== '') {
    changeSyncCode(code);
  }
}

function manualSyncTrigger() {
  if (typeof toast === 'function') {
    toast("🔄 Checking cloud for updates...");
  }
  syncPull(true);
}

// Expose functions globally
window.syncPush = syncPush;
window.syncPull = syncPull;
window.promptSyncCode = promptSyncCode;
window.manualSyncTrigger = manualSyncTrigger;
