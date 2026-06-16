(function () {
    const API = '';
    let token = sessionStorage.getItem('adminToken') || '';

    // --- DOM refs ---
    const loginScreen = document.getElementById('loginScreen');
    const dashboard = document.getElementById('adminDashboard');
    const loginForm = document.getElementById('loginForm');
    const loginError = document.getElementById('loginError');
    const logoutBtn = document.getElementById('logoutBtn');
    const navItems = document.querySelectorAll('.sidebar-nav .nav-item');
    const programsSection = document.getElementById('programsSection');
    const gallerySection = document.getElementById('gallerySection');
    const eventsSection = document.getElementById('eventsSection');
    const programsList = document.getElementById('programsList');
    const galleryList = document.getElementById('galleryList');
    const eventsList = document.getElementById('eventsList');

    // Program modal
    const programModal = document.getElementById('programModal');
    const programForm = document.getElementById('programForm');
    const programModalTitle = document.getElementById('programModalTitle');
    const closeProgramModal = document.getElementById('closeProgramModal');
    const cancelProgramModal = document.getElementById('cancelProgramModal');
    const addProgramBtn = document.getElementById('addProgramBtn');
    const programImageInput = document.getElementById('programImage');
    const programImagePreview = document.getElementById('programImagePreview');

    // Gallery modal
    const galleryModal = document.getElementById('galleryModal');
    const galleryForm = document.getElementById('galleryForm');
    const closeGalleryModal = document.getElementById('closeGalleryModal');
    const cancelGalleryModal = document.getElementById('cancelGalleryModal');
    const addGalleryBtn = document.getElementById('addGalleryBtn');
    const galleryImages = document.getElementById('galleryImages');
    const uploadPreviewList = document.getElementById('uploadPreviewList');
    const fileDropZone = document.getElementById('fileDropZone');

    // --- Toast ---
    function showToast(msg, type = 'success') {
        const toast = document.getElementById('toast');
        toast.textContent = msg;
        toast.className = 'toast show ' + type;
        setTimeout(() => { toast.className = 'toast'; }, 3000);
    }

    // --- Auth ---
    function authHeaders() {
        return { 'Authorization': 'Bearer ' + token };
    }

    function showDashboard() {
        loginScreen.style.display = 'none';
        dashboard.style.display = 'flex';
        loadPrograms();
    }

    function showLogin() {
        loginScreen.style.display = 'flex';
        dashboard.style.display = 'none';
        token = '';
        sessionStorage.removeItem('adminToken');
    }

    if (token) {
        showDashboard();
    }

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        loginError.textContent = '';
        const password = document.getElementById('loginPassword').value;
        try {
            const res = await fetch(API + '/api/admin/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password })
            });
            const data = await res.json();
            if (data.success) {
                token = data.token;
                sessionStorage.setItem('adminToken', token);
                showDashboard();
            } else {
                loginError.textContent = data.message || 'Login failed';
            }
        } catch {
            loginError.textContent = 'Connection error';
        }
    });

    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        showLogin();
    });

    // --- Navigation ---
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const section = item.dataset.section;
            navItems.forEach(n => n.classList.remove('active'));
            item.classList.add('active');
            programsSection.style.display = section === 'programs' ? 'block' : 'none';
            gallerySection.style.display = section === 'gallery' ? 'block' : 'none';
            eventsSection.style.display = section === 'events' ? 'block' : 'none';
            if (section === 'programs') loadPrograms();
            if (section === 'gallery') loadGallery();
            if (section === 'events') loadEvents();
        });
    });

    // --- Programs ---
    async function loadPrograms() {
        try {
            const res = await fetch(API + '/api/programs');
            const programs = await res.json();
            renderPrograms(programs);
        } catch {
            programsList.innerHTML = '<div class="empty-state"><i class="fas fa-exclamation-circle"></i><p>Failed to load programs</p></div>';
        }
    }

    function renderPrograms(programs) {
        if (!programs.length) {
            programsList.innerHTML = '<div class="empty-state"><i class="fas fa-folder-open"></i><p>No programs yet. Click "Add Program" to get started.</p></div>';
            return;
        }
        programsList.innerHTML = programs.map(p => `
            <div class="program-card">
                <div class="card-image">
                    <img src="${escapeHtml(p.image)}" alt="${escapeHtml(p.title)}" onerror="this.src='img/Screenshot 2025-11-29 133504.png'">
                    <span class="card-badge">${escapeHtml(p.category)}</span>
                </div>
                <div class="card-body">
                    <h4>${escapeHtml(p.title)}</h4>
                    ${p.titleTa ? '<div class="card-title-ta">' + escapeHtml(p.titleTa) + '</div>' : ''}
                    <p>${escapeHtml(p.description)}</p>
                    <div class="card-actions">
                        <button class="btn btn-secondary btn-sm" onclick="adminApp.editProgram(${p.id})">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="btn btn-danger btn-sm" onclick="adminApp.deleteProgram(${p.id}, '${escapeHtml(p.title)}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // Add Program
    addProgramBtn.addEventListener('click', () => {
        programModalTitle.textContent = 'Add Program';
        programForm.reset();
        document.getElementById('programId').value = '';
        programImagePreview.style.display = 'none';
        programModal.classList.add('active');
    });

    closeProgramModal.addEventListener('click', () => programModal.classList.remove('active'));
    cancelProgramModal.addEventListener('click', () => programModal.classList.remove('active'));

    programImageInput.addEventListener('change', () => {
        const file = programImageInput.files[0];
        if (file) {
            programImagePreview.src = URL.createObjectURL(file);
            programImagePreview.style.display = 'block';
        }
    });

    programForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('programId').value;
        const formData = new FormData();
        formData.append('title', document.getElementById('programTitle').value);
        formData.append('titleTa', document.getElementById('programTitleTa').value);
        formData.append('description', document.getElementById('programDesc').value);
        formData.append('descriptionTa', document.getElementById('programDescTa').value);
        formData.append('category', document.getElementById('programCategory').value);
        if (programImageInput.files[0]) {
            formData.append('image', programImageInput.files[0]);
        }

        const url = id ? API + '/api/admin/programs/' + id : API + '/api/admin/programs';
        const method = id ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method,
                headers: authHeaders(),
                body: formData
            });
            const data = await res.json();
            if (data.success) {
                showToast(id ? 'Program updated!' : 'Program added!');
                programModal.classList.remove('active');
                loadPrograms();
            } else {
                showToast(data.message || 'Error saving program', 'error');
            }
        } catch {
            showToast('Connection error', 'error');
        }
    });

    // Edit Program
    async function editProgram(id) {
        try {
            const res = await fetch(API + '/api/programs');
            const programs = await res.json();
            const p = programs.find(prog => prog.id === id);
            if (!p) return;

            programModalTitle.textContent = 'Edit Program';
            document.getElementById('programId').value = p.id;
            document.getElementById('programTitle').value = p.title;
            document.getElementById('programTitleTa').value = p.titleTa || '';
            document.getElementById('programDesc').value = p.description;
            document.getElementById('programDescTa').value = p.descriptionTa || '';
            document.getElementById('programCategory').value = p.category;
            programImageInput.value = '';
            if (p.image) {
                programImagePreview.src = p.image;
                programImagePreview.style.display = 'block';
            } else {
                programImagePreview.style.display = 'none';
            }
            programModal.classList.add('active');
        } catch {
            showToast('Failed to load program', 'error');
        }
    }

    // Delete Program
    async function deleteProgram(id, title) {
        if (!confirm('Delete program "' + title + '"?')) return;
        try {
            const res = await fetch(API + '/api/admin/programs/' + id, {
                method: 'DELETE',
                headers: authHeaders()
            });
            const data = await res.json();
            if (data.success) {
                showToast('Program deleted');
                loadPrograms();
            } else {
                showToast(data.message || 'Error', 'error');
            }
        } catch {
            showToast('Connection error', 'error');
        }
    }

    // --- Gallery ---
    async function loadGallery() {
        try {
            const res = await fetch(API + '/api/gallery');
            const images = await res.json();
            renderGallery(images);
        } catch {
            galleryList.innerHTML = '<div class="empty-state"><i class="fas fa-exclamation-circle"></i><p>Failed to load gallery</p></div>';
        }
    }

    function renderGallery(images) {
        if (!images.length) {
            galleryList.innerHTML = '<div class="empty-state"><i class="fas fa-images"></i><p>No gallery images yet.</p></div>';
            return;
        }
        galleryList.innerHTML = images.map(img => `
            <div class="gallery-item">
                <img src="${escapeHtml(img)}" alt="Gallery image">
                <div class="gallery-overlay">
                    <button onclick="adminApp.deleteGalleryImage('${escapeHtml(img)}')" title="Remove image">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    // Add Gallery Images
    addGalleryBtn.addEventListener('click', () => {
        galleryForm.reset();
        uploadPreviewList.innerHTML = '';
        galleryModal.classList.add('active');
    });

    closeGalleryModal.addEventListener('click', () => galleryModal.classList.remove('active'));
    cancelGalleryModal.addEventListener('click', () => galleryModal.classList.remove('active'));

    galleryImages.addEventListener('change', () => {
        uploadPreviewList.innerHTML = '';
        const MAX_SIZE = 5 * 1024 * 1024;
        Array.from(galleryImages.files).forEach(file => {
            const wrapper = document.createElement('div');
            wrapper.style.position = 'relative';
            wrapper.style.display = 'inline-block';
            const img = document.createElement('img');
            img.src = URL.createObjectURL(file);
            wrapper.appendChild(img);
            if (file.size > MAX_SIZE) {
                img.style.border = '2px solid #ef4444';
                img.style.opacity = '0.5';
                const badge = document.createElement('span');
                badge.textContent = '>' + (file.size / (1024*1024)).toFixed(1) + 'MB';
                badge.style.cssText = 'position:absolute;bottom:2px;left:2px;background:#ef4444;color:#fff;font-size:0.6rem;padding:1px 4px;border-radius:4px;';
                wrapper.appendChild(badge);
            }
            uploadPreviewList.appendChild(wrapper);
        });
    });

    // Drag & drop visual
    fileDropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        fileDropZone.classList.add('dragover');
    });
    fileDropZone.addEventListener('dragleave', () => {
        fileDropZone.classList.remove('dragover');
    });
    fileDropZone.addEventListener('drop', () => {
        fileDropZone.classList.remove('dragover');
    });

    galleryForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const files = galleryImages.files;
        if (!files.length) {
            showToast('Select at least one image', 'error');
            return;
        }

        const MAX_SIZE = 5 * 1024 * 1024; // 5MB
        let uploaded = 0;
        let skipped = [];

        for (const file of files) {
            if (file.size > MAX_SIZE) {
                skipped.push(file.name);
                continue;
            }
            const formData = new FormData();
            formData.append('image', file);
            try {
                const res = await fetch(API + '/api/admin/gallery', {
                    method: 'POST',
                    headers: authHeaders(),
                    body: formData
                });
                const data = await res.json();
                if (data.success) {
                    uploaded++;
                } else {
                    skipped.push(file.name + ' (' + data.message + ')');
                }
            } catch {
                skipped.push(file.name);
            }
        }

        if (skipped.length > 0) {
            showToast(skipped.length + ' image(s) skipped — exceeds 5MB limit', 'error');
        }
        if (uploaded > 0) {
            showToast(uploaded + ' image(s) uploaded!', 'success');
        } else if (skipped.length > 0 && uploaded === 0) {
            showToast('No images uploaded. All files exceed the 5MB size limit.', 'error');
        }

        galleryModal.classList.remove('active');
        loadGallery();
    });

    // Delete Gallery Image
    async function deleteGalleryImage(imagePath) {
        if (!confirm('Remove this image from gallery?')) return;
        try {
            const res = await fetch(API + '/api/admin/gallery', {
                method: 'DELETE',
                headers: { ...authHeaders(), 'Content-Type': 'application/json' },
                body: JSON.stringify({ image: imagePath })
            });
            const data = await res.json();
            if (data.success) {
                showToast('Image removed');
                loadGallery();
            } else {
                showToast(data.message || 'Error', 'error');
            }
        } catch {
            showToast('Connection error', 'error');
        }
    }

    // --- Utility ---
    function escapeHtml(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    // --- Events ---
    const eventModal = document.getElementById('eventModal');
    const eventForm = document.getElementById('eventForm');
    const eventModalTitle = document.getElementById('eventModalTitle');
    const closeEventModal = document.getElementById('closeEventModal');
    const cancelEventModal = document.getElementById('cancelEventModal');
    const addEventBtn = document.getElementById('addEventBtn');
    const eventImageInput = document.getElementById('eventImage');
    const eventImagePreview = document.getElementById('eventImagePreview');
    let eventsData = [];
    let eventsTab = 'upcoming';

    // Events tabs
    document.querySelectorAll('.events-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.events-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            eventsTab = tab.dataset.tab;
            renderEvents();
        });
    });

    async function loadEvents() {
        try {
            const res = await fetch(API + '/api/events');
            eventsData = await res.json();
            renderEvents();
        } catch {
            eventsList.innerHTML = '<div class="empty-state"><i class="fas fa-exclamation-circle"></i><p>Failed to load events</p></div>';
        }
    }

    function renderEvents() {
        const today = new Date().toISOString().split('T')[0];
        const filtered = eventsData.filter(e => {
            if (eventsTab === 'upcoming') return e.date >= today;
            return e.date < today;
        }).sort((a, b) => eventsTab === 'upcoming' ? a.date.localeCompare(b.date) : b.date.localeCompare(a.date));

        if (!filtered.length) {
            eventsList.innerHTML = `<div class="empty-state"><i class="fas fa-calendar-times"></i><p>No ${eventsTab} events.</p></div>`;
            return;
        }

        eventsList.innerHTML = filtered.map(ev => {
            const isUpcoming = ev.date >= today;
            const dateStr = new Date(ev.date + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
            return `
            <div class="program-card event-card">
                <div class="card-image">
                    <img src="${escapeHtml(ev.image)}" alt="${escapeHtml(ev.title)}" onerror="this.src='img/Screenshot 2025-11-29 133504.png'">
                </div>
                <div class="card-body">
                    <h4>${escapeHtml(ev.title)}</h4>
                    <div class="card-date">
                        <i class="fas fa-calendar"></i> ${dateStr}
                        <span class="date-badge ${isUpcoming ? 'upcoming' : 'past'}">${isUpcoming ? 'Upcoming' : 'Past'}</span>
                    </div>
                    <div class="card-actions">
                        <button class="btn btn-secondary btn-sm" onclick="adminApp.editEvent(${ev.id})">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="btn btn-danger btn-sm" onclick="adminApp.deleteEvent(${ev.id}, '${escapeHtml(ev.title)}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>`;
        }).join('');
    }

    // Add Event
    addEventBtn.addEventListener('click', () => {
        eventModalTitle.textContent = 'Add Event';
        eventForm.reset();
        document.getElementById('eventId').value = '';
        eventImagePreview.style.display = 'none';
        eventModal.classList.add('active');
    });

    closeEventModal.addEventListener('click', () => eventModal.classList.remove('active'));
    cancelEventModal.addEventListener('click', () => eventModal.classList.remove('active'));

    eventImageInput.addEventListener('change', () => {
        const file = eventImageInput.files[0];
        if (file) {
            eventImagePreview.src = URL.createObjectURL(file);
            eventImagePreview.style.display = 'block';
        }
    });

    eventForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('eventId').value;
        const formData = new FormData();
        formData.append('title', document.getElementById('eventTitle').value);
        formData.append('date', document.getElementById('eventDate').value);
        if (eventImageInput.files[0]) {
            formData.append('image', eventImageInput.files[0]);
        } else if (!id) {
            showToast('Event poster image is required', 'error');
            return;
        }

        const url = id ? API + '/api/admin/events/' + id : API + '/api/admin/events';
        const method = id ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, { method, headers: authHeaders(), body: formData });
            const data = await res.json();
            if (data.success) {
                showToast(id ? 'Event updated!' : 'Event added!');
                eventModal.classList.remove('active');
                loadEvents();
            } else {
                showToast(data.message || 'Error saving event', 'error');
            }
        } catch {
            showToast('Connection error', 'error');
        }
    });

    async function editEvent(id) {
        const ev = eventsData.find(e => e.id === id);
        if (!ev) return;
        eventModalTitle.textContent = 'Edit Event';
        document.getElementById('eventId').value = ev.id;
        document.getElementById('eventTitle').value = ev.title;
        document.getElementById('eventDate').value = ev.date;
        eventImageInput.value = '';
        if (ev.image) {
            eventImagePreview.src = ev.image;
            eventImagePreview.style.display = 'block';
        } else {
            eventImagePreview.style.display = 'none';
        }
        eventModal.classList.add('active');
    }

    async function deleteEvent(id, title) {
        if (!confirm('Delete event "' + title + '"?')) return;
        try {
            const res = await fetch(API + '/api/admin/events/' + id, {
                method: 'DELETE',
                headers: authHeaders()
            });
            const data = await res.json();
            if (data.success) {
                showToast('Event deleted');
                loadEvents();
            } else {
                showToast(data.message || 'Error', 'error');
            }
        } catch {
            showToast('Connection error', 'error');
        }
    }

    // Close modals on backdrop click
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.classList.remove('active');
        });
    });

    // Expose for onclick handlers
    window.adminApp = { editProgram, deleteProgram, deleteGalleryImage, editEvent, deleteEvent };
})();
