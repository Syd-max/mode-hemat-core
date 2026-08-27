const app = {
    state: {
        user: null,
        transactions: [],
        quickLogs: [
            { id: 1, name: 'Jajan', amount: 15000, category: 'Jajan', icon: 'ph-ice-cream' },
            { id: 2, name: 'Makan', amount: 25000, category: 'Makan', icon: 'ph-hamburger' },
            { id: 3, name: 'Kopi', amount: 18000, category: 'Kopi', icon: 'ph-coffee' },
            { id: 4, name: 'Transport', amount: 10000, category: 'Transport', icon: 'ph-car' },
            { id: 5, name: 'Belanja', amount: 50000, category: 'Belanja', icon: 'ph-shopping-bag' },
            { id: 6, name: 'Pulsa', amount: 20000, category: 'Lainnya', icon: 'ph-device-mobile' },
            { id: 7, name: 'Nongkrong', amount: 35000, category: 'Lainnya', icon: 'ph-users' },
            { id: 8, name: 'Parkir', amount: 2000, category: 'Transport', icon: 'ph-motorcycle' }
        ],
        theme: 'light' // light or dark
    },
    
    selectedHomeDate: new Date(),

    init() {
        this.loadData();
        this.applyTheme();
        this.setupNavigation();
        this.setupCategoryPills();
        
        // Ensure date picker is set to today on load
        document.getElementById('home-date-picker').valueAsDate = new Date();
        
        if (!this.state.user) {
            this.showView('view-onboarding');
            document.getElementById('bottom-nav').classList.add('hidden');
        } else {
            this.showView('view-home');
            document.getElementById('main-layout').classList.remove('hidden');
            document.getElementById('bottom-nav').classList.remove('hidden');
            this.updateAllViews();
        }
    },

    loadData() {
        const saved = localStorage.getItem('modeHematData');
        if (saved) {
            const parsed = JSON.parse(saved);
            this.state.user = parsed.user || null;
            this.state.transactions = parsed.transactions || [];
            if (parsed.quickLogs) this.state.quickLogs = parsed.quickLogs;
            if (parsed.theme) this.state.theme = parsed.theme;
        }
    },

    saveData() {
        localStorage.setItem('modeHematData', JSON.stringify(this.state));
        this.updateAllViews();
    },

    // --- THEME ---
    toggleTheme() {
        this.state.theme = this.state.theme === 'light' ? 'dark' : 'light';
        this.applyTheme();
        this.saveData();
    },

    applyTheme() {
        if (this.state.theme === 'dark') {
            document.body.classList.add('dark-mode');
            document.getElementById('theme-toggle').innerHTML = '<i class="ph ph-sun"></i>';
        } else {
            document.body.classList.remove('dark-mode');
            document.getElementById('theme-toggle').innerHTML = '<i class="ph ph-moon"></i>';
        }
    },

    // --- UTILS (FORMATTING) ---
    formatRp(num) {
        return 'Rp' + parseInt(num).toLocaleString('id-ID');
    },
    
    formatNumberStr(num) {
        return parseInt(num).toLocaleString('id-ID');
    },

    // Format input as user types (auto add dots)
    formatInput(el) {
        // Remove non-digits
        let val = el.value.replace(/\D/g, '');
        if (val !== '') {
            val = parseInt(val).toLocaleString('id-ID');
        }
        el.value = val;
    },

    // Get raw number from formatted input
    getRawNumber(valStr) {
        if (!valStr) return 0;
        return parseInt(valStr.replace(/\./g, '')) || 0;
    },

    getDateStr(dateObj) {
        const d = dateObj || new Date();
        const options = { weekday: 'long', day: 'numeric', month: 'long' };
        return d.toLocaleDateString('id-ID', options);
    },

    // --- MODALS ---
    openModal(id) {
        document.getElementById(id).classList.add('show');
        if (id === 'modal-quick-log') {
            this.renderQuickLogEdit();
        }
    },

    closeModal(id) {
        document.getElementById(id).classList.remove('show');
    },

    // --- NAVIGATION ---
    setupNavigation() {
        const navBtns = document.querySelectorAll('.nav-item');
        navBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const target = btn.getAttribute('data-target');
                navBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.showView(`view-${target}`);
            });
        });
    },

    showView(viewId) {
        document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));
        const view = document.getElementById(viewId);
        if (view) {
            view.classList.remove('hidden');
            if (viewId === 'view-kalkulator') this.calcClear();
            if (viewId === 'view-catat') {
                document.getElementById('catat-amount').value = '';
                document.getElementById('catat-name').value = '';
                document.getElementById('catat-note').value = '';
            }
        }
    },

    // --- ONBOARDING ---
    nextOnboarding() {
        document.getElementById('onboarding-step-1').classList.add('hidden');
        document.getElementById('onboarding-step-2').classList.remove('hidden');
    },

    finishOnboarding() {
        const name = document.getElementById('ob-name').value || 'Sobat';
        const moneyInput = document.getElementById('ob-money').value;
        const budgetInput = document.getElementById('ob-budget').value;

        if (!budgetInput) {
            this.showToast('Isi budgetnya ge!');
            return;
        }

        const money = this.getRawNumber(moneyInput);
        const budget = this.getRawNumber(budgetInput);

        if (budget <= 0) {
            this.showToast('Budget harus diisi lebih dari Rp0!');
            return;
        }

        this.state.user = { name, initialMoney: money, budget, currentMoney: money };
        this.saveData();

        document.getElementById('view-onboarding').classList.add('hidden');
        document.getElementById('main-layout').classList.remove('hidden');
        document.getElementById('bottom-nav').classList.remove('hidden');
        this.showView('view-home');
        this.showToast(`Halo ${name}, mari mulai atur uang!`);
    },

    // --- CORE LOGIC ---
    addTransaction(name, amount, category, note = '') {
        const tx = {
            id: Date.now(),
            date: new Date().toISOString(),
            name,
            amount: parseInt(amount),
            category,
            note
        };
        
        this.state.user.currentMoney -= tx.amount;
        this.state.transactions.unshift(tx);
        
        // Reset selected date to today when adding a transaction so they see it
        this.selectedHomeDate = new Date();
        const datePicker = document.getElementById('home-date-picker');
        if(datePicker) datePicker.valueAsDate = this.selectedHomeDate;

        this.saveData();
        this.showToast(`${name} dicatat`, true, tx.id);
    },

    undoTransaction(id) {
        const index = this.state.transactions.findIndex(t => t.id === id);
        if (index > -1) {
            const tx = this.state.transactions[index];
            this.state.user.currentMoney += tx.amount;
            this.state.transactions.splice(index, 1);
            this.saveData();
            this.showToast('Transaksi dibatalkan');
        }
    },

    // --- QUICK LOG EDIT ---
    renderQuickLogEdit() {
        const list = document.getElementById('ql-edit-list');
        list.innerHTML = '';
        this.state.quickLogs.forEach(ql => {
            list.innerHTML += `
                <div class="ql-edit-item" id="ql-edit-${ql.id}">
                    <div class="ql-edit-input-group">
                        <input type="text" id="ql-edit-name-${ql.id}" value="${ql.name}" class="mb-2">
                        <div class="input-prefix">
                            <span>Rp</span>
                            <input type="text" inputmode="numeric" id="ql-edit-amt-${ql.id}" value="${this.formatNumberStr(ql.amount)}" oninput="app.formatInput(this)">
                        </div>
                    </div>
                    <div class="ql-edit-actions">
                        <button class="icon-btn" onclick="app.saveEditQuickLog(${ql.id})" style="background:var(--primary-light); color:var(--primary);"><i class="ph ph-check-bold"></i></button>
                        <button class="icon-btn" onclick="app.removeQuickLog(${ql.id})" style="background:var(--danger-light); color:var(--danger);"><i class="ph ph-trash"></i></button>
                    </div>
                </div>
            `;
        });
    },
    
    saveEditQuickLog(id) {
        const name = document.getElementById(`ql-edit-name-${id}`).value;
        const amount = this.getRawNumber(document.getElementById(`ql-edit-amt-${id}`).value);
        
        if(!name || amount <= 0) {
            this.showToast('Nama dan nominal tidak valid'); return;
        }
        
        const index = this.state.quickLogs.findIndex(q => q.id === id);
        if(index > -1) {
            this.state.quickLogs[index].name = name;
            this.state.quickLogs[index].amount = amount;
            this.saveData();
            this.showToast('Perubahan tersimpan');
            this.renderQuickLogEdit();
        }
    },

    addQuickLog() {
        const name = document.getElementById('ql-new-name').value;
        const amount = this.getRawNumber(document.getElementById('ql-new-amount').value);
        if (!name || amount <= 0) {
            this.showToast('Nama dan nominal harus diisi!');
            return;
        }
        this.state.quickLogs.push({
            id: Date.now(),
            name,
            amount,
            category: 'Lainnya',
            icon: 'ph-dots-three'
        });
        document.getElementById('ql-new-name').value = '';
        document.getElementById('ql-new-amount').value = '';
        this.saveData();
        this.renderQuickLogEdit();
        this.showToast('Item baru ditambahkan');
    },

    removeQuickLog(id) {
        if(confirm('Hapus item ini dari Quick Log?')) {
            this.state.quickLogs = this.state.quickLogs.filter(ql => ql.id !== id);
            this.saveData();
            this.renderQuickLogEdit();
        }
    },

    // --- HOME VIEW ---
    changeHomeDate() {
        const picker = document.getElementById('home-date-picker');
        if (picker.value) {
            // Create date treating the value as local time
            const [y, m, d] = picker.value.split('-');
            this.selectedHomeDate = new Date(y, m - 1, d);
            this.updateHomeView();
        }
    },

    updateHomeView() {
        if (!this.state.user) return;

        // Date Display
        const isToday = this.selectedHomeDate.toDateString() === new Date().toDateString();
        document.getElementById('home-date').innerText = this.getDateStr(this.selectedHomeDate);
        
        // Days left in month
        const now = new Date();
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        const daysLeft = endOfMonth.getDate() - now.getDate();
        document.getElementById('home-days-left').innerText = `${daysLeft} hari tersisa bulan ini`;

        // Money
        document.getElementById('home-money-balance').innerText = this.formatRp(this.state.user.currentMoney);
        
        // Budget calculations (Current Month)
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        
        const thisMonthTxs = this.state.transactions.filter(t => {
            const d = new Date(t.date);
            return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        });
        
        const spentThisMonth = thisMonthTxs.reduce((sum, t) => sum + t.amount, 0);
        const budgetLeft = this.state.user.budget - spentThisMonth;
        const progressPct = Math.min((spentThisMonth / this.state.user.budget) * 100, 100);

        document.getElementById('home-budget-total').innerText = this.formatRp(this.state.user.budget);
        document.getElementById('home-budget-left').innerText = this.formatRp(budgetLeft);
        document.getElementById('home-budget-used').innerText = this.formatRp(spentThisMonth);
        
        const pb = document.getElementById('home-budget-progress');
        pb.style.width = progressPct + '%';
        if (progressPct >= 90) pb.style.backgroundColor = 'var(--danger)';
        else pb.style.backgroundColor = 'var(--primary)';

        // Quick Logs
        const qlContainer = document.getElementById('quick-log-container');
        qlContainer.innerHTML = '';
        this.state.quickLogs.forEach(ql => {
            const btn = document.createElement('div');
            btn.className = 'ql-btn';
            btn.innerHTML = `
                <div class="ql-icon"><i class="ph ${ql.icon}"></i></div>
                <div class="ql-name">${ql.name}</div>
                <div class="ql-amt">${this.formatRp(ql.amount)}</div>
            `;
            btn.onclick = () => {
                this.addTransaction(ql.name, ql.amount, ql.category);
            };
            qlContainer.appendChild(btn);
        });

        // Transactions for selected date
        const selDateStr = this.selectedHomeDate.toDateString();
        const dayTxs = this.state.transactions.filter(t => new Date(t.date).toDateString() === selDateStr);
        const spentDay = dayTxs.reduce((sum, t) => sum + t.amount, 0);
        
        document.getElementById('home-tx-title').innerText = isToday ? 'Pengeluaran Hari Ini' : 'Pengeluaran Tanggal Ini';
        document.getElementById('home-today-total').innerText = this.formatRp(spentDay);
        
        // Status indicator
        const dailyBudget = this.state.user.budget / endOfMonth.getDate();
        const statusEl = document.getElementById('home-daily-status');
        
        if (spentDay === 0) {
            statusEl.className = 'daily-status';
            statusEl.innerHTML = '<i class="ph-fill ph-check-circle"></i><span id="home-daily-msg">Belum ada pengeluaran. In this economy.</span>';
        } else if (spentDay > dailyBudget * 1.5) {
            statusEl.className = 'daily-status warning';
            statusEl.innerHTML = '<i class="ph-fill ph-warning-circle"></i><span id="home-daily-msg">Waduh, pelan-pelan pak sopir.</span>';
        } else if (spentDay > dailyBudget) {
            statusEl.className = 'daily-status warning';
            statusEl.innerHTML = '<i class="ph-fill ph-info"></i><span id="home-daily-msg">Sedikit lewat budget harian weh</span>';
        } else {
            statusEl.className = 'daily-status';
            statusEl.innerHTML = '<i class="ph-fill ph-check-circle"></i><span id="home-daily-msg">Aman azza, masih on track.</span>';
        }

        // List
        const txList = document.getElementById('home-transaction-list');
        txList.innerHTML = '';
        if (dayTxs.length === 0) {
            txList.innerHTML = `<div class="tx-empty">Belum ada pengeluaran<br>Hemat or gak ada duit.</div>`;
        } else {
            dayTxs.forEach(t => {
                const time = new Date(t.date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
                const iconMap = { 'Makan': 'ph-hamburger', 'Jajan': 'ph-ice-cream', 'Transport': 'ph-car', 'Belanja': 'ph-shopping-bag', 'Kopi': 'ph-coffee', 'Lainnya': 'ph-dots-three' };
                const icon = iconMap[t.category] || 'ph-receipt';
                
                txList.innerHTML += `
                    <div class="tx-item">
                        <div class="tx-info">
                            <div class="tx-icon"><i class="ph ${icon}"></i></div>
                            <div class="tx-details">
                                <h4>${t.name}</h4>
                                <p>${time} • ${t.category}</p>
                            </div>
                        </div>
                        <div class="tx-amount">- ${this.formatRp(t.amount)}</div>
                    </div>
                `;
            });
        }
    },

    // --- CATAT VIEW ---
    setupCategoryPills() {
        const pills = document.querySelectorAll('.cat-pill');
        pills.forEach(p => {
            p.onclick = () => {
                pills.forEach(x => x.classList.remove('active'));
                p.classList.add('active');
            };
        });
    },

    saveManualTransaction() {
        const amtInput = this.getRawNumber(document.getElementById('catat-amount').value);
        const nameInput = document.getElementById('catat-name').value;
        const noteInput = document.getElementById('catat-note').value;
        const activeCat = document.querySelector('.cat-pill.active').getAttribute('data-cat');

        if (amtInput <= 0) {
            this.showToast('Isi yang bener ge');
            return;
        }
        
        const name = nameInput || activeCat;
        this.addTransaction(name, amtInput, activeCat, noteInput);
        
        document.querySelector('.nav-item[data-target="home"]').click();
    },

    // --- KALKULATOR VIEW ---
    calcString: '',
    
    calcInput(val) {
        if (this.calcString === '0' && val !== '000') this.calcString = val;
        else if (val === '000' && this.calcString === '') return;
        else this.calcString += val;
        this.updateCalcDisplay();
    },

    calcDelete() {
        this.calcString = this.calcString.slice(0, -1);
        this.updateCalcDisplay();
    },

    calcClear() {
        this.calcString = '';
        this.updateCalcDisplay();
    },

    updateCalcDisplay() {
        const display = document.getElementById('calc-input');
        const result = document.getElementById('calc-result-money');
        const avail = document.getElementById('calc-available');
        const sourceLabel = document.getElementById('calc-source-label');
        
        if (!this.state.user) return;

        // Determine base value based on radio selection
        const sourceType = document.querySelector('input[name="calc-source"]:checked').value;
        let baseMoney = 0;

        if (sourceType === 'money') {
            baseMoney = this.state.user.currentMoney;
            sourceLabel.innerText = "Uang tersedia";
        } else {
            // Calculate budget left
            const currentMonth = new Date().getMonth();
            const currentYear = new Date().getFullYear();
            const thisMonthTxs = this.state.transactions.filter(t => {
                const d = new Date(t.date);
                return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
            });
            const spentThisMonth = thisMonthTxs.reduce((sum, t) => sum + t.amount, 0);
            baseMoney = this.state.user.budget - spentThisMonth;
            sourceLabel.innerText = "Sisa budget bulan ini";
        }
        
        avail.innerText = this.formatRp(baseMoney);

        if (this.calcString === '') {
            display.innerText = '0';
            result.innerText = this.formatRp(baseMoney);
            result.classList.remove('text-danger');
            result.classList.add('text-main');
        } else {
            const num = parseInt(this.calcString);
            display.innerText = '- ' + num.toLocaleString('id-ID');
            
            const left = baseMoney - num;
            result.innerText = this.formatRp(left);
            
            if (left < 0) {
                result.style.color = 'var(--danger)';
            } else {
                result.style.color = 'var(--primary)';
            }
        }
    },

    // --- PROFIL & HISTORY VIEW ---
    updateProfilView(searchTerm = '') {
        if (!this.state.user) return;

        document.getElementById('profile-name').innerText = this.state.user.name;
        document.getElementById('profile-avatar').innerText = this.state.user.name.charAt(0).toUpperCase();

        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        
        const thisMonthTxs = this.state.transactions.filter(t => {
            const d = new Date(t.date);
            return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        });
        
        const spentThisMonth = thisMonthTxs.reduce((sum, t) => sum + t.amount, 0);
        const daysPassed = new Date().getDate();
        const avgDaily = Math.round(spentThisMonth / daysPassed);
        const budgetLeft = this.state.user.budget - spentThisMonth;

        document.getElementById('profile-total-spent').innerText = this.formatRp(spentThisMonth);
        document.getElementById('profile-avg-daily').innerText = this.formatRp(avgDaily);
        document.getElementById('profile-total-tx').innerText = thisMonthTxs.length;
        
        const blEl = document.getElementById('profile-budget-left');
        blEl.innerText = this.formatRp(budgetLeft);
        blEl.style.color = budgetLeft < 0 ? 'var(--danger)' : 'var(--primary)';

        const list = document.getElementById('history-list');
        list.innerHTML = '';

        let filteredTxs = this.state.transactions;
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filteredTxs = filteredTxs.filter(t => 
                t.name.toLowerCase().includes(term) || 
                t.category.toLowerCase().includes(term) ||
                t.amount.toString().includes(term)
            );
        }

        const grouped = {};
        filteredTxs.forEach(t => {
            const dStr = new Date(t.date).toDateString();
            if (!grouped[dStr]) grouped[dStr] = [];
            grouped[dStr].push(t);
        });

        if (Object.keys(grouped).length === 0) {
            list.innerHTML = `<div class="tx-empty">Belum jajan ya kamu.</div>`;
            return;
        }

        for (const [dateStr, txs] of Object.entries(grouped)) {
            const d = new Date(dateStr);
            const headerDate = this.getDateStr(d);
            const totalDay = txs.reduce((sum, t) => sum + t.amount, 0);
            
            const groupEl = document.createElement('div');
            groupEl.className = 'history-group mb-4';
            
            const headerId = 'hdr-' + d.getTime();
            
            let itemsHtml = txs.map(t => {
                const time = new Date(t.date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
                return `
                    <div class="tx-item" style="padding: 12px 0;">
                        <div class="tx-info">
                            <div class="tx-details">
                                <h4 style="font-size:14px;">${t.name}</h4>
                                <p style="font-size:11px;">${time} • ${t.category}</p>
                            </div>
                        </div>
                        <div class="tx-amount" style="font-size:14px;">- ${this.formatRp(t.amount)}</div>
                    </div>
                `;
            }).join('');

            // FIXED HEADER OVERLAP: Stacked Date/Count on left, Amount/Arrow on right
            groupEl.innerHTML = `
                <div class="history-date-header" onclick="app.toggleHistory('${headerId}')">
                    <div class="history-date-left">
                        <span class="text-main font-bold" style="font-size: 15px;">${headerDate}</span>
                        <span class="text-muted" style="font-size: 12px;">${txs.length} transaksi</span>
                    </div>
                    <div class="history-date-right">
                        <span class="text-primary font-bold" style="font-size: 15px;">${this.formatRp(totalDay)}</span>
                        <i class="ph ph-caret-down" id="icon-${headerId}"></i>
                    </div>
                </div>
                <div class="history-items" id="${headerId}">
                    ${itemsHtml}
                </div>
            `;
            list.appendChild(groupEl);
            
            setTimeout(() => {
                const itemsEl = document.getElementById(headerId);
                if(itemsEl) itemsEl.style.maxHeight = itemsEl.scrollHeight + "px";
            }, 10);
        }
    },

    toggleHistory(id) {
        const el = document.getElementById(id);
        const icon = document.getElementById(`icon-${id}`);
        if (el.style.maxHeight && el.style.maxHeight !== '0px') {
            el.style.maxHeight = '0px';
            icon.parentElement.parentElement.classList.add('collapsed');
        } else {
            el.style.maxHeight = el.scrollHeight + "px";
            icon.parentElement.parentElement.classList.remove('collapsed');
        }
    },

    searchTransactions() {
        const term = document.getElementById('search-tx').value;
        this.updateProfilView(term);
    },

    // CSV to proper Excel/HTML format
    exportExcel() {
        if (this.state.transactions.length === 0) {
            this.showToast('Tidak ada data untuk di-export');
            return;
        }

        let table = `<table border="1">
            <tr>
                <th style="background-color: #6C5CE7; color: white;">Tanggal</th>
                <th style="background-color: #6C5CE7; color: white;">Waktu</th>
                <th style="background-color: #6C5CE7; color: white;">Nama Pengeluaran</th>
                <th style="background-color: #6C5CE7; color: white;">Kategori</th>
                <th style="background-color: #6C5CE7; color: white;">Jumlah (Rp)</th>
                <th style="background-color: #6C5CE7; color: white;">Catatan</th>
            </tr>`;
        
        this.state.transactions.forEach(t => {
            const d = new Date(t.date);
            table += `<tr>
                <td>${d.toLocaleDateString('id-ID')}</td>
                <td>${d.toLocaleTimeString('id-ID')}</td>
                <td>${t.name}</td>
                <td>${t.category}</td>
                <td>${t.amount}</td>
                <td>${t.note || '-'}</td>
            </tr>`;
        });
        table += `</table>`;

        const blob = new Blob([table], { type: 'application/vnd.ms-excel' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Mode_Hemat_Export_${new Date().toISOString().slice(0,10)}.xls`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showToast('Excel berhasil di-download');
    },

    resetData() {
        if (confirm("Yakin mau hapus semua pencatatan? Data tidak bisa dikembalikan.")) {
            localStorage.removeItem('modeHematData');
            location.reload();
        }
    },

    // --- UTILS ---
    updateAllViews() {
        this.updateHomeView();
        this.updateCalcDisplay();
        this.updateProfilView();
    },

    toastTimeout: null,
    showToast(msg, withUndo = false, txId = null) {
        const toast = document.getElementById('toast');
        const msgEl = document.getElementById('toast-msg');
        const actionBtn = document.getElementById('toast-action');
        
        msgEl.innerText = msg;
        
        if (withUndo && txId) {
            actionBtn.classList.remove('hidden');
            actionBtn.onclick = () => {
                this.undoTransaction(txId);
                toast.classList.remove('show');
            };
        } else {
            actionBtn.classList.add('hidden');
        }

        toast.classList.add('show');
        
        clearTimeout(this.toastTimeout);
        this.toastTimeout = setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
};

window.onload = () => app.init();
