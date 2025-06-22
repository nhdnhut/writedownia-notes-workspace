document.addEventListener('DOMContentLoaded', () => {
    const app = {
        db: null,
        defaultDB: {
            settings: { theme: 'dark' },
            notes: {}, 
            tasks: [],
            flashcardSets: {},
        },
        menuItems: [
            { id: 'dashboard', name: 'Dashboard', icon: 'layout-dashboard' },
            { id: 'notes', name: 'Notes', icon: 'notebook-tabs' },
            { id: 'journal', name: 'Journal', icon: 'book-heart' },
            { id: 'flashcards', name: 'Flashcards', icon: 'copy' },
            { id: 'calendar', name: 'Calendar', icon: 'calendar-days' },
            { id: 'checklist', name: 'Checklist', icon: 'check-square' },
        ],
        state: {
            currentView: 'dashboard',
            calendarDate: new Date(),
            attachments: [],
            isRecording: false,
            mediaRecorder: null,
            audioChunks: [],
            currentFlashcardSet: null,
            currentCardIndex: 0,
        },
        elements: {},

        init() {
            this.populateViews();
            this.elements = this.getElements();
            this.loadData();
            this.applyTheme();
            this.renderMenu();
            this.registerEventListeners();
            this.navigateTo('dashboard', true);
            lucide.createIcons();
        },
        
        getElements() {
            return {
                mainNav: document.getElementById('main-nav'),
                views: document.querySelectorAll('.view'),
                // Dashboard
                dueTodayList: document.getElementById('due-today-list'),
                weeklyGallery: document.getElementById('weekly-gallery'),
                statsNotes: document.getElementById('stats-notes'),
                statsTasks: document.getElementById('stats-tasks'),
                statsFlashcards: document.getElementById('stats-flashcards'),
                // Notes
                notesViewTitle: document.getElementById('notes-view-title'),
                notesGrid: document.getElementById('notes-grid'),
                noteCreationColumn: document.getElementById('note-creation-column'),
                notesListColumn: document.getElementById('notes-list-column'),
                notesListTitle: document.getElementById('notes-list-title'),
                addNoteBtn: document.getElementById('add-note-btn'),
                notesList: document.getElementById('notes-list'),
                noteTitle: document.getElementById('note-title'),
                noteContent: document.getElementById('note-content'),
                noteTags: document.getElementById('note-tags'),
                noteDueDate: document.getElementById('note-due-date'),
                addFileBtn: document.getElementById('add-file-btn'),
                fileInput: document.getElementById('file-input'),
                recordVoiceBtn: document.getElementById('record-voice-btn'),
                attachmentsPreview: document.getElementById('attachments-preview'),
                recordStatus: document.getElementById('record-status'),
                // Journal & Archive
                journalEntryText: document.getElementById('journal-entry-text'),
                moodPicker: document.getElementById('mood-picker'),
                saveJournalBtn: document.getElementById('save-journal-btn'),
                viewAllJournalsBtn: document.getElementById('view-all-journals-btn'),
                archiveList: document.getElementById('archive-list'),
                // Checklist
                newTaskInput: document.getElementById('new-task-input'),
                newTaskDueDate: document.getElementById('new-task-due-date'),
                addTaskBtn: document.getElementById('add-task-btn'),
                taskList: document.getElementById('task-list'),
                progressBar: document.getElementById('progress-bar'),
                // Calendar
                calendarGrid: document.getElementById('calendar-grid'),
                calendarTitle: document.getElementById('calendar-title'),
                prevMonthBtn: document.getElementById('prev-month-btn'),
                nextMonthBtn: document.getElementById('next-month-btn'),
                calendarModal: document.getElementById('calendar-modal'),
                modalDate: document.getElementById('modal-date'),
                modalContent: document.getElementById('modal-content'),
                closeModalBtn: document.getElementById('close-modal-btn'),
                // Flashcards
                flashcardMainView: document.getElementById('flashcard-main-view'),
                flashcardSetView: document.getElementById('flashcard-set-view'),
                newFlashcardSetTitle: document.getElementById('new-flashcard-set-title'),
                addFlashcardSetBtn: document.getElementById('add-flashcard-set-btn'),
                flashcardGallery: document.getElementById('flashcard-gallery'),
                backToGalleryBtn: document.getElementById('back-to-gallery-btn'),
                flashcardSetTitle: document.getElementById('flashcard-set-title'),
                studyArea: document.getElementById('study-area'),
                studyCard: document.getElementById('study-card'),
                studyCardFront: document.getElementById('study-card-front'),
                studyCardBack: document.getElementById('study-card-back'),
                studyProgress: document.getElementById('study-progress'),
                prevCardBtn: document.getElementById('prev-card-btn'),
                flipCardBtn: document.getElementById('flip-card-btn'),
                nextCardBtn: document.getElementById('next-card-btn'),
                flashcardLimitMsg: document.getElementById('flashcard-limit-msg'),
                newCardFront: document.getElementById('new-card-front'),
                newCardBack: document.getElementById('new-card-back'),
                addCardToSetBtn: document.getElementById('add-card-to-set-btn'),
                // Settings
                themeSelect: document.getElementById('theme-select'),
                exportBtn: document.getElementById('export-json-btn'),
                importBtn: document.getElementById('import-json-btn'),
                importInput: document.getElementById('import-file-input'),
                deleteAllDataBtn: document.getElementById('delete-all-data-btn'),
            }
        },

        populateViews() {
             document.getElementById('checklist').innerHTML = `<h2 class="text-4xl font-bold mb-6">Checklist</h2><div class="bg-[var(--bg-secondary)] p-6 rounded-lg border border-[var(--border-color)] max-w-3xl mx-auto"><div class="flex flex-col md:flex-row gap-2 mb-4"><input type="text" id="new-task-input" class="flex-grow p-2 rounded form-input" placeholder="Add a new task..."><input type="date" id="new-task-due-date" class="p-2 rounded form-input" title="Optional due date"><button id="add-task-btn" class="btn !p-2 rounded-lg flex items-center justify-center md:w-auto"><i data-lucide="plus" class="w-6 h-6"></i></button></div><div class="w-full bg-gray-300 dark:bg-gray-700 rounded-full h-2.5 mb-4"><div id="progress-bar" class="bg-[var(--accent-color)] h-2.5 rounded-full" style="width: 0%"></div></div><ul id="task-list" class="space-y-2"></ul></div>`;
             document.getElementById('calendar').innerHTML = `<h2 class="text-4xl font-bold mb-6">Master Calendar</h2><div class="bg-[var(--bg-secondary)] p-6 rounded-lg border border-[var(--border-color)]"><div class="flex justify-between items-center mb-4"><button id="prev-month-btn" class="btn !p-2 rounded-lg"><i data-lucide="chevron-left"></i></button><h3 id="calendar-title" class="text-2xl font-bold"></h3><button id="next-month-btn" class="btn !p-2 rounded-lg"><i data-lucide="chevron-right"></i></button></div><div class="grid grid-cols-7 text-center font-bold border-b border-[var(--border-color)] pb-2 mb-2"><span>SUN</span><span>MON</span><span>TUE</span><span>WED</span><span>THU</span><span>FRI</span><span>SAT</span></div><div id="calendar-grid" class="grid grid-cols-7"></div></div><div id="calendar-modal" class="hidden fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50"><div class="bg-[var(--bg-main)] p-6 rounded-lg border border-[var(--border-color)] max-w-2xl w-full max-h-[80vh] flex flex-col"><div class="flex justify-between items-center mb-4"><h4 id="modal-date" class="text-2xl font-bold"></h4><button id="close-modal-btn" class="btn-outline !p-1 !rounded-full"><i data-lucide="x"></i></button></div><div id="modal-content" class="space-y-4 overflow-y-auto pr-2"></div><button id="modal-add-task-btn" class="btn w-full p-2 mt-4 rounded-lg font-bold">Add New Task for this Day</button></div></div>`;
             document.getElementById('settings').innerHTML = `<h2 class="text-4xl font-bold mb-6">Settings</h2><div class="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl"><div class="bg-[var(--bg-secondary)] p-6 rounded-lg border border-[var(--border-color)]"><h3 class="font-semibold text-2xl mb-4">Appearance</h3><p class="mb-2 font-sans text-sm">Theme:</p><select id="theme-select" class="w-full p-2 rounded form-input"><option value="light">Light</option><option value="dark">Dark</option></select></div><div class="bg-[var(--bg-secondary)] p-6 rounded-lg border border-[var(--border-color)]"><h3 class="font-semibold text-2xl mb-4">Data Management</h3><div class="flex space-x-2"><button id="export-json-btn" class="btn flex-1">Backup</button><button id="import-json-btn" class="btn flex-1">Restore</button><input type="file" id="import-file-input" accept=".json" class="hidden"></div><div class="mt-4 border-t border-[var(--border-color)] pt-4"><button id="delete-all-data-btn" class="btn-outline w-full !border-red-500 !text-red-500 hover:!bg-red-500 hover:!text-white">Delete All Data</button><p class="text-xs font-sans text-center mt-2 text-[var(--text-secondary)]">This action is permanent and cannot be undone.</p></div></div></div>`;
        },
        
        // --- Core Data & UI Functions ---
        loadData() {
             const savedDB = localStorage.getItem('writedownia_unified');
             this.db = savedDB ? { ...this.defaultDB, ...JSON.parse(savedDB) } : JSON.parse(JSON.stringify(this.defaultDB));
             if (!this.db.flashcardSets) this.db.flashcardSets = {};
             if (!this.db.notes) this.db.notes = {};
             if (!this.db.tasks) this.db.tasks = [];
        },
        saveData() {
            localStorage.setItem('writedownia_unified', JSON.stringify(this.db));
            this.updateDashboardStats();
        },
        applyTheme() {
            document.documentElement.className = this.db.settings.theme;
            if(this.elements.themeSelect) this.elements.themeSelect.value = this.db.settings.theme;
        },
        renderMenu() { 
            this.elements.mainNav.innerHTML = this.menuItems.map(item => `<a href="#" data-view="${item.id}" class="sidebar-link flex items-center p-2 rounded-lg"><i data-lucide="${item.icon}" class="w-5 h-5 mr-3"></i><span>${item.name}</span></a>`).join('');
        },
        navigateTo(viewId, isInitial = false) {
            this.state.currentView = viewId;
            this.elements.views.forEach(v => v.classList.remove('active-view'));
            document.getElementById(viewId)?.classList.add('active-view');
            document.querySelectorAll('.sidebar-link').forEach(l => {
                l.classList.toggle('active', l.dataset.view === viewId);
            });

            if (viewId === 'notes') this.renderNotesList();
            if (viewId === 'journal') this.loadTodayJournalEntry();
            if (viewId === 'archive') this.renderArchiveList();
            if (viewId === 'checklist') this.renderChecklist();
            if (viewId === 'calendar') this.renderCalendar();
            if (viewId === 'flashcards') this.renderFlashcardGallery();
            if (viewId === 'dashboard' || isInitial) this.updateDashboard();
            
            lucide.createIcons();
        },
        updateDashboard() {
            this.updateDashboardStats();
            this.renderWeeklyGallery();
            this.renderDueToday();
            lucide.createIcons();
        },
        updateDashboardStats() {
            if(!this.elements.statsNotes) return;
            const noteCount = Object.values(this.db.notes).length;
            this.elements.statsNotes.textContent = `Notes & Journals: ${noteCount}`;
            this.elements.statsTasks.textContent = `Tasks: ${this.db.tasks.length}`;
            this.elements.statsFlashcards.textContent = `Flashcard Sets: ${Object.keys(this.db.flashcardSets).length}`;
        },

        // --- Event Listeners ---
        registerEventListeners() {
            document.querySelector('.app-container').addEventListener('click', e => {
                const link = e.target.closest('.sidebar-link');
                if (link) { e.preventDefault(); this.navigateTo(link.dataset.view); }
            });

            // Notes
            this.elements.addNoteBtn?.addEventListener('click', () => this.addNote());
            this.elements.addFileBtn?.addEventListener('click', () => this.elements.fileInput.click());
            this.elements.fileInput?.addEventListener('change', e => this.handleFileUpload(e));
            this.elements.recordVoiceBtn?.addEventListener('click', () => this.toggleVoiceRecording());
            this.elements.notesList?.addEventListener('click', e => {
                const id = e.target.closest('[data-id]')?.dataset.id;
                if (id && e.target.closest('.delete-note-btn')) this.deleteNote(id);
            });
            this.elements.archiveList?.addEventListener('click', e => {
                const id = e.target.closest('[data-id]')?.dataset.id;
                if (id && e.target.closest('.delete-note-btn')) this.deleteNote(id);
            });
            
            // Journal
            this.elements.saveJournalBtn?.addEventListener('click', () => this.saveJournalEntry());
            this.elements.moodPicker?.addEventListener('click', e => {
                 const moodBtn = e.target.closest('.mood-btn');
                if (moodBtn) {
                    document.querySelectorAll('.mood-btn').forEach(btn => btn.classList.remove('selected'));
                    moodBtn.classList.add('selected');
                }
            });
            this.elements.viewAllJournalsBtn?.addEventListener('click', () => this.navigateTo('archive'));


            // Flashcards
            this.elements.addFlashcardSetBtn?.addEventListener('click', () => this.addFlashcardSet());
            this.elements.flashcardGallery?.addEventListener('click', e => {
                 const setCard = e.target.closest('.flashcard-set-card');
                 if (setCard) this.openFlashcardSet(setCard.dataset.setId);
            });
            this.elements.backToGalleryBtn?.addEventListener('click', () => this.closeFlashcardSet());
            this.elements.addCardToSetBtn?.addEventListener('click', () => this.addCardToSet());
            this.elements.studyCard?.addEventListener('click', () => this.elements.studyCard.classList.toggle('is-flipped'));
            this.elements.prevCardBtn?.addEventListener('click', () => this.changeStudyCard(-1));
            this.elements.nextCardBtn?.addEventListener('click', () => this.changeStudyCard(1));

            // Checklist
             this.elements.addTaskBtn?.addEventListener('click', () => this.addTask());
             this.elements.taskList?.addEventListener('click', e => {
                const id = e.target.closest('[data-id]')?.dataset.id;
                if (!id) return;
                if (e.target.closest('.delete-task-btn')) this.deleteTask(id);
                if (e.target.matches('input[type="checkbox"]')) this.toggleTask(id);
             });

            // Calendar
             this.elements.prevMonthBtn?.addEventListener('click', () => this.changeMonth(-1));
             this.elements.nextMonthBtn?.addEventListener('click', () => this.changeMonth(1));
             this.elements.calendarGrid?.addEventListener('click', e => {
                const dayEl = e.target.closest('.calendar-day[data-date]');
                if (dayEl) this.showCalendarModal(dayEl.dataset.date);
             });
             this.elements.closeModalBtn?.addEventListener('click', () => this.elements.calendarModal.classList.add('hidden'));
             document.getElementById('modal-add-task-btn')?.addEventListener('click', e => {
                this.addTaskForDate(e.currentTarget.dataset.date);
             });
             
            // Settings
             this.elements.themeSelect?.addEventListener('change', e => {
                this.db.settings.theme = e.target.value;
                this.saveData();
                this.applyTheme();
             });
             this.elements.exportBtn?.addEventListener('click', () => this.exportData());
             this.elements.importBtn?.addEventListener('click', () => this.elements.importInput.click());
             this.elements.importInput?.addEventListener('change', e => this.importData(e));
             this.elements.deleteAllDataBtn?.addEventListener('click', () => this.deleteAllData());
        },

        // --- Feature Logic ---
        
        renderDueToday() {
            const todayStr = new Date().toISOString().slice(0, 10);
            const dueNotes = Object.values(this.db.notes).filter(n => n.dueDate === todayStr);
            const dueTasks = this.db.tasks.filter(t => t.dueDate === todayStr && !t.done);

            let content = '';
            if (dueNotes.length === 0 && dueTasks.length === 0) {
                this.elements.dueTodayList.innerHTML = `<p class="text-[var(--text-secondary)] italic">Nothing is due today.</p>`;
                return;
            }

            dueTasks.forEach(task => {
                content += `<div class="p-2 border-b border-[var(--border-color)] text-sm flex items-center gap-2"><i data-lucide="check-square" class="w-4 h-4 text-[var(--text-secondary)]"></i><p>${task.text}</p></div>`;
            });
            dueNotes.forEach(note => {
                content += `<div class="p-2 border-b border-[var(--border-color)] text-sm flex items-center gap-2"><i data-lucide="notebook-tabs" class="w-4 h-4 text-[var(--text-secondary)]"></i><p>${note.title}</p></div>`;
            });

            this.elements.dueTodayList.innerHTML = content;
            lucide.createIcons();
        },

        renderWeeklyGallery() {
            this.elements.weeklyGallery.innerHTML = '';
            const today = new Date();
            const dayOfWeek = today.getDay(); 
            
            for (let i = 0; i < 7; i++) {
                const date = new Date(today);
                date.setDate(today.getDate() - dayOfWeek + i);
                const dateStr = date.toISOString().slice(0, 10);
                const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });

                const notesOnDay = Object.values(this.db.notes).filter(n => n.createdAt.startsWith(dateStr));
                const journalOnDay = notesOnDay.find(n => n.type === 'journal');
                
                const card = document.createElement('div');
                card.className = 'p-2 border border-[var(--border-color)] rounded-lg bg-[var(--bg-main)] min-h-[80px] transition-all hover:border-[var(--text-main)] cursor-pointer';
                card.innerHTML = `
                    <p class="font-bold text-center">${dayName} <span class="text-sm text-[var(--text-secondary)]">${date.getDate()}</span></p>
                    <div class="mt-2 text-center text-xs space-y-1 font-sans">
                        ${journalOnDay ? `<p class="text-2xl">${journalOnDay.mood || ''}</p>` : ''}
                        ${notesOnDay.length > 0 ? `<p>${notesOnDay.length} item(s)</p>` : '<p class="text-[var(--text-secondary)] italic">No activity</p>'}
                    </div>
                `;
                this.elements.weeklyGallery.appendChild(card);
            }
        },
        
        addNote() {
            const title = this.elements.noteTitle.value.trim();
            if (!title) { alert('Please enter a title.'); return; }
            const id = `note_${Date.now()}`;
            this.db.notes[id] = {
                id, title,
                type: 'note',
                content: this.elements.noteContent.value.trim(),
                tags: this.elements.noteTags.value.split(',').map(t => t.trim()).filter(Boolean),
                dueDate: this.elements.noteDueDate.value,
                attachments: this.state.attachments,
                createdAt: new Date().toISOString()
            };
            this.saveData();
            this.renderNotesList();
            this.resetNoteForm();
            this.updateDashboard();
            this.renderCalendar();
        },
        resetNoteForm() {
            this.elements.noteTitle.value = ''; this.elements.noteContent.value = '';
            this.elements.noteTags.value = ''; this.elements.noteDueDate.value = '';
            this.state.attachments = []; this.elements.attachmentsPreview.innerHTML = '';
        },
        renderNotesList() {
            const notes = Object.values(this.db.notes).filter(n => n.type === 'note').sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
            this.elements.notesList.innerHTML = notes.length ? notes.map(note => `
                <div class="p-4 border border-[var(--border-color)] rounded-lg transition-all hover:border-[var(--text-main)] cursor-pointer" data-id="${note.id}">
                    <div class="flex justify-between items-start">
                         <div class="flex-grow">
                            <h4 class="font-bold text-xl">${note.title}</h4>
                            <p class="font-sans text-sm mt-1 text-[var(--text-secondary)]">${note.content.substring(0,150)}...</p>
                            ${note.dueDate ? `<p class="font-sans text-xs mt-2 text-[var(--text-secondary)]">Due: ${note.dueDate}</p>` : ''}
                            ${note.attachments.length ? `<div class="text-xs mt-2 font-sans flex gap-2 items-center text-[var(--text-secondary)]"><i data-lucide="paperclip" class="w-3 h-3"></i> ${note.attachments.length} attachment(s)</div>` : ''}
                         </div>
                         <button class="delete-note-btn btn-outline !p-1 !rounded-full ml-2 shrink-0"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
                    </div>
                </div>
            `).join('') : `<p class="text-[var(--text-secondary)] text-center">No notes yet.</p>`;
            lucide.createIcons();
        },
        deleteNote(id) {
            delete this.db.notes[id];
            this.saveData();
            if (this.state.currentView === 'notes') this.renderNotesList();
            if (this.state.currentView === 'archive') this.renderArchiveList();
            this.renderCalendar();
            this.updateDashboard();
        },
        
        // --- Attachments & Voice Logic ---
        handleFileUpload(event) {
            const files = event.target.files; if (!files.length) return;
            for (const file of files) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    this.state.attachments.push({ name: file.name, type: file.type, size: file.size, data: e.target.result });
                    this.renderAttachmentsPreview();
                };
                reader.readAsDataURL(file);
            }
        },
        toggleVoiceRecording() {
            if (this.state.isRecording) {
                this.state.mediaRecorder.stop();
                this.elements.recordVoiceBtn.classList.remove('recording');
                this.elements.recordStatus.textContent = "Processing...";
            } else {
                navigator.mediaDevices.getUserMedia({ audio: true })
                    .then(stream => {
                        this.state.isRecording = true; this.state.audioChunks = [];
                        this.state.mediaRecorder = new MediaRecorder(stream); this.state.mediaRecorder.start();
                        this.elements.recordVoiceBtn.classList.add('recording');
                        this.elements.recordStatus.textContent = "Recording... Click again to stop.";
                        this.state.mediaRecorder.addEventListener("dataavailable", e => this.state.audioChunks.push(e.data));
                        this.state.mediaRecorder.addEventListener("stop", () => {
                            const audioBlob = new Blob(this.state.audioChunks, { type: 'audio/wav' });
                            const reader = new FileReader();
                            reader.onload = e => {
                                this.state.attachments.push({ name: `recording_${Date.now()}.wav`, type: 'audio/wav', data: e.target.result });
                                this.renderAttachmentsPreview();
                            };
                            reader.readAsDataURL(audioBlob);
                            stream.getTracks().forEach(track => track.stop());
                            this.state.isRecording = false; this.elements.recordStatus.textContent = "Recording saved as attachment.";
                        });
                    }).catch(err => { console.error(err); alert("Could not access microphone."); });
            }
        },
        renderAttachmentsPreview() {
            this.elements.attachmentsPreview.innerHTML = this.state.attachments.map((file, index) => `
                <div class="flex items-center justify-between p-1 bg-gray-200 dark:bg-gray-700 rounded text-sm font-sans">
                    <span>${file.name.substring(0, 25)}...</span>
                    <button data-index="${index}" class="remove-attachment-btn text-[var(--text-secondary)] hover:text-[var(--text-main)]"><i data-lucide="x-circle" class="w-4 h-4"></i></button>
                </div>`).join('');
             document.querySelectorAll('.remove-attachment-btn').forEach(btn => btn.addEventListener('click', e => {
                this.state.attachments.splice(e.currentTarget.dataset.index, 1);
                this.renderAttachmentsPreview();
             }));
            lucide.createIcons();
        },
        
        // --- Journal & Archive Logic ---
        saveJournalEntry() {
            const content = this.elements.journalEntryText.value.trim();
            const mood = document.querySelector('.mood-btn.selected')?.dataset.mood;
            if (!content && !mood) { alert('Please write something or select a mood.'); return; }
            const todayStr = new Date().toISOString().slice(0, 10);
            let existingEntry = Object.values(this.db.notes).find(n => n.type === 'journal' && n.createdAt.startsWith(todayStr));
            
            if (existingEntry) {
                existingEntry.content = content; existingEntry.mood = mood;
            } else {
                const id = `note_${Date.now()}`;
                this.db.notes[id] = { id, content, mood, title: `Journal - ${new Date().toLocaleDateString('en-US')}`, type: 'journal', createdAt: new Date().toISOString() };
            }
            this.saveData(); alert('Journal entry saved!');
        },
        loadTodayJournalEntry() {
            const todayStr = new Date().toISOString().slice(0, 10);
            const todayEntry = Object.values(this.db.notes).find(n => n.type === 'journal' && n.createdAt.startsWith(todayStr));
            document.querySelectorAll('.mood-btn').forEach(btn => btn.classList.remove('selected'));
            if (todayEntry) {
                this.elements.journalEntryText.value = todayEntry.content;
                if(todayEntry.mood) document.querySelector(`.mood-btn[data-mood="${todayEntry.mood}"]`)?.classList.add('selected');
            } else {
                this.elements.journalEntryText.value = '';
            }
        },
        renderArchiveList() {
            const notes = Object.values(this.db.notes).filter(n => n.type === 'journal').sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
            this.elements.archiveList.innerHTML = notes.length ? notes.map(note => `
                 <div class="p-4 border border-[var(--border-color)] rounded-lg transition-all hover:border-[var(--text-main)] cursor-pointer" data-id="${note.id}">
                    <div class="flex justify-between items-start">
                         <div class="flex-grow">
                            <h4 class="font-bold text-xl">${note.title} ${note.mood || ''}</h4>
                            <p class="font-sans text-sm mt-1 text-[var(--text-secondary)]">${note.content}</p>
                         </div>
                         <button class="delete-note-btn btn-outline !p-1 !rounded-full ml-2 shrink-0"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
                    </div>
                </div>
            `).join('') : `<p class="text-[var(--text-secondary)] text-center">No journal entries found.</p>`;
            lucide.createIcons();
        },
        showAllJournals() { this.navigateTo('archive'); },

        // --- Checklist & Calendar Logic ---
        addTask() {
            const text = this.elements.newTaskInput.value.trim();
            const dueDate = this.elements.newTaskDueDate.value;
            if(text){
                this.db.tasks.push({id: `task_${Date.now()}`, text, done: false, dueDate});
                this.elements.newTaskInput.value = ''; this.elements.newTaskDueDate.value = '';
                this.saveData(); this.renderChecklist(); this.renderCalendar(); this.updateDashboard();
            }
        },
        renderChecklist(){
            if (!this.elements.taskList) return;
            this.db.tasks.sort((a,b) => (a.dueDate || '9999') > (b.dueDate || '9999') ? 1 : -1);
            this.elements.taskList.innerHTML = this.db.tasks.map(task => `
                <li data-id="${task.id}" class="flex items-center p-2 font-sans text-sm border-b border-[var(--border-color)] transition-colors hover:bg-[var(--bg-input)] rounded">
                    <input type="checkbox" data-id="${task.id}" class="h-4 w-4 mr-3 shrink-0" ${task.done ? 'checked' : ''}>
                    <div class="flex-grow ${task.done ? 'line-through opacity-50' : ''}">
                       <p>${task.text}</p>
                       ${task.dueDate ? `<p class="text-xs text-[var(--text-secondary)]">Due: ${task.dueDate}</p>` : ''}
                    </div>
                    <button data-id="${task.id}" class="delete-task-btn p-1 ml-2"><i data-lucide="x" class="w-4 h-4"></i></button>
                </li>
            `).join('');
            const total = this.db.tasks.length;
            const completed = this.db.tasks.filter(t => t.done).length;
            this.elements.progressBar.style.width = total > 0 ? `${(completed/total)*100}%` : '0%';
            lucide.createIcons();
        },
        toggleTask(id){
            const task = this.db.tasks.find(t => t.id === id);
            if(task) { task.done = !task.done; this.saveData(); this.renderChecklist(); }
        },
        deleteTask(id){
            this.db.tasks = this.db.tasks.filter(t => t.id !== id);
            this.saveData(); this.renderChecklist(); this.renderCalendar(); this.updateDashboard();
        },
        renderCalendar() {
            if (!this.elements.calendarGrid) return;
            const date = this.state.calendarDate; const year = date.getFullYear(); const month = date.getMonth();
            this.elements.calendarTitle.textContent = new Date(year, month).toLocaleString('en-US', { month: 'long', year: 'numeric' });
            this.elements.calendarGrid.innerHTML = '';
            const firstDay = new Date(year, month, 1).getDay(); const daysInMonth = new Date(year, month + 1, 0).getDate();
            const dueNotes = this.getDueItems(this.db.notes); const dueTasks = this.getDueItems(this.db.tasks);

            for (let i = 0; i < firstDay; i++) { this.elements.calendarGrid.insertAdjacentHTML('beforeend', '<div class="calendar-day other-month"></div>'); }
            for (let i = 1; i <= daysInMonth; i++) {
                const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
                const notesOnDay = dueNotes[dateStr] || []; const tasksOnDay = dueTasks[dateStr] || [];
                const hasItems = notesOnDay.length > 0 || tasksOnDay.length > 0;
                const allItems = [...notesOnDay.map(n => ({ type: 'note', text: n.title })), ...tasksOnDay.map(t => ({ type: 'task', text: t.text }))];
                let itemsHTML = allItems.slice(0, 3).map(item => `<div class="cal-item cal-item-${item.type}">${item.text}</div>`).join('');
                if (allItems.length > 3) { itemsHTML += `<div class="text-xs text-center text-[var(--text-secondary)] font-sans mt-1">... and ${allItems.length - 3} more</div>`; }
                this.elements.calendarGrid.insertAdjacentHTML('beforeend', `<div class="calendar-day ${hasItems ? 'has-due-date' : ''}" data-date="${dateStr}"><span class="font-bold">${i}</span><div class="mt-1 space-y-1 overflow-hidden">${itemsHTML}</div></div>`);
            }
        },
        getDueItems(itemSource) {
            return Object.values(itemSource).filter(item => item.dueDate).reduce((acc, item) => {
                if (!acc[item.dueDate]) acc[item.dueDate] = []; acc[item.dueDate].push(item); return acc;
            }, {});
        },
        changeMonth(offset) { this.state.calendarDate.setMonth(this.state.calendarDate.getMonth() + offset); this.renderCalendar(); },
        showCalendarModal(dateStr) {
            const date = new Date(dateStr + 'T00:00:00Z');
            this.elements.modalDate.textContent = `Due on: ${date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}`;
            const notesOnDate = Object.values(this.db.notes).filter(note => note.dueDate === dateStr);
            const tasksOnDate = this.db.tasks.filter(task => task.dueDate === dateStr);
            let contentHTML = '';
            if(notesOnDate.length > 0) contentHTML += `<h5 class="font-bold text-xl mb-2">Notes</h5>` + notesOnDate.map(note => `<div class="p-2 border border-[var(--border-color)] rounded"><p class="font-bold">${note.title}</p></div>`).join('');
            if(tasksOnDate.length > 0) contentHTML += `<h5 class="font-bold text-xl mt-4 mb-2">Tasks</h5>` + tasksOnDate.map(task => `<div class="p-2 border border-[var(--border-color)] rounded font-sans text-sm ${task.done ? 'line-through opacity-50' : ''}">${task.text}</div>`).join('');
            this.elements.modalContent.innerHTML = contentHTML || `<p class="text-[var(--text-secondary)] italic">No items due on this day.</p>`;
            const modalAddTaskBtn = document.getElementById('modal-add-task-btn');
            if (modalAddTaskBtn) modalAddTaskBtn.dataset.date = dateStr;
            this.elements.calendarModal.classList.remove('hidden');
            lucide.createIcons();
        },
        addTaskForDate(dateStr) {
            this.elements.calendarModal.classList.add('hidden');
            this.navigateTo('checklist');
            this.elements.newTaskDueDate.value = dateStr; this.elements.newTaskInput.focus();
        },

        // --- Flashcard Logic ---
        addFlashcardSet() {
            const title = this.elements.newFlashcardSetTitle.value.trim();
            if (!title) { alert('Please enter a set title.'); return; }
            const setId = `set_${Date.now()}`;
            this.db.flashcardSets[setId] = { id: setId, title: title, createdAt: new Date().toISOString(), cards: [] };
            this.saveData(); this.renderFlashcardGallery();
            this.elements.newFlashcardSetTitle.value = '';
            this.updateDashboard();
        },
        renderFlashcardGallery() {
            if (!this.elements.flashcardGallery) return;
            const sets = Object.values(this.db.flashcardSets).sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
            this.elements.flashcardGallery.innerHTML = sets.length ? sets.map(set => `
                <div class="flashcard-set-card p-4 border border-[var(--border-color)] rounded-lg cursor-pointer hover:border-[var(--text-main)]" data-set-id="${set.id}">
                    <h4 class="font-bold text-xl">${set.title}</h4>
                    <p class="font-sans text-sm text-[var(--text-secondary)]">${set.cards.length} cards</p>
                </div>
            `).join('') : `<p class="text-[var(--text-secondary)] italic col-span-2">No flashcard sets yet.</p>`;
        },
        openFlashcardSet(setId) {
            this.state.currentFlashcardSet = setId; this.state.currentCardIndex = 0;
            this.elements.flashcardMainView.classList.add('hidden');
            this.elements.flashcardSetView.classList.remove('hidden');
            this.renderStudyView();
        },
        closeFlashcardSet() {
            this.state.currentFlashcardSet = null;
            this.elements.flashcardMainView.classList.remove('hidden');
            this.elements.flashcardSetView.classList.add('hidden');
        },
        addCardToSet() {
            const set = this.db.flashcardSets[this.state.currentFlashcardSet];
            if (set.cards.length >= 150) { alert('Maximum of 150 cards per set reached.'); return; }
            const front = this.elements.newCardFront.value.trim();
            const back = this.elements.newCardBack.value.trim();
            if (!front || !back) { alert('Please fill out both front and back of the card.'); return; }
            set.cards.push({ id: `card_${Date.now()}`, front, back });
            this.saveData();
            this.elements.newCardFront.value = ''; this.elements.newCardBack.value = '';
            this.renderStudyView();
            this.renderFlashcardGallery(); // Update count in gallery view
        },
        renderStudyView() {
            const set = this.db.flashcardSets[this.state.currentFlashcardSet];
            if (!set) return;
            this.elements.flashcardSetTitle.textContent = set.title;
            this.elements.flashcardLimitMsg.textContent = `${set.cards.length}/150 cards`;
            if (set.cards.length > 0) {
                this.elements.studyArea.style.display = 'block';
                const card = set.cards[this.state.currentCardIndex];
                this.elements.studyCardFront.textContent = card.front;
                this.elements.studyCardBack.textContent = card.back;
                this.elements.studyProgress.textContent = `Card ${this.state.currentCardIndex + 1} of ${set.cards.length}`;
                this.elements.studyCard.classList.remove('is-flipped');
            } else {
                this.elements.studyArea.style.display = 'none';
                this.elements.studyProgress.textContent = `Add a card to begin studying.`;
            }
        },
        changeStudyCard(direction) {
             const set = this.db.flashcardSets[this.state.currentFlashcardSet];
             if (!set || set.cards.length === 0) return;
             this.state.currentCardIndex += direction;
             if (this.state.currentCardIndex < 0) this.state.currentCardIndex = set.cards.length - 1;
             if (this.state.currentCardIndex >= set.cards.length) this.state.currentCardIndex = 0;
             this.renderStudyView();
        },

        // --- Settings & Data ---
        deleteAllData() {
            localStorage.removeItem('writedownia_unified');
            this.elements.deleteAllDataBtn.textContent = 'Deleting...';
            setTimeout(() => {
                location.reload();
            }, 500);
        },
        exportData() {
            const dataStr = JSON.stringify(this.db, null, 2);
            const blob = new Blob([dataStr], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a'); a.href = url;
            a.download = `writedownia_backup_${new Date().toISOString().slice(0, 10)}.json`;
            a.click(); URL.revokeObjectURL(url);
        },
        importData(event) {
            const file = event.target.files[0]; if (!file) return;
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const importedData = JSON.parse(e.target.result);
                    this.db = importedData;
                    this.saveData();
                    alert('Import successful! Reloading application...');
                    location.reload();
                } catch (error) {
                    alert('Error: Invalid file. ' + error.message);
                }
            };
            reader.readAsText(file); event.target.value = '';
        },
    };

    app.init();
});
