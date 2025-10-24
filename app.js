// app.js - Budget Tracker SPA (vanilla JS)

//Helpers
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

/* ------- STORAGE KEYS ------- */
const STORAGE_KEY = 'bt_expenses_v1';
const STORAGE_BUDGET = 'bt_budget_v1';
const STORAGE_CURRENCY = 'bt_currency_v1';
const STORAGE_LANGUAGE = 'bt_language_v1'; 

let currency = loadCurrency();
let currentLang = loadLanguage();

function loadCurrency(){
  return localStorage.getItem(STORAGE_CURRENCY) || 'EUR';
}
function saveCurrency(code){
  localStorage.setItem(STORAGE_CURRENCY, code);
}
function loadLanguage(){
  return localStorage.getItem(STORAGE_LANGUAGE) || 'en'; // Default to English
}
function saveLanguage(code){
  localStorage.setItem(STORAGE_LANGUAGE, code);
}

/* ------- TRANSLATION DATA ------- */
const translations = {
  en: {
    // Nav/Header
    'app_title': 'Budget Tracker',
    'nav_dashboard': 'Dashboard',
    'nav_add': 'Add Expense',
    'nav_history': 'History',
    
    // Dashboard
    'dash_budget': 'Monthly Budget',
    'dash_spent': 'Spent',
    'dash_remaining': 'Remaining',
    'dash_chart_title': 'Spending this month',
    'dash_budget_label': 'Monthly budget:',
    'dash_save_btn': 'Save budget',
    'dash_budget_placeholder': 'e.g. 1000',
    
    // Add Expense
    'add_title': 'Add Expense',
    'add_field_title': 'Title',
    'add_field_amount': 'Amount',
    'add_field_category': 'Category',
    'add_field_date': 'Date',
    'add_btn_submit': 'Add',
    'add_btn_clear': 'Clear',

    // History
    'history_title': 'History',
    'history_filter_month': 'Month:',
    'history_filter_category': 'Category:',
    'history_all': 'All',
    'history_reset': 'Reset',
    'history_csv': 'Download CSV',
    'history_no_expenses': 'No expenses for selected filters.',
    'history_delete_confirm': 'Delete this expense?',
    'history_edit_confirm': 'This will delete the item and open Add view prefilled for editing. Continue?',
    'history_alert_not_found': 'Not found',

    // Categories
    'cat_other': 'Other',
    'cat_food': 'Food',
    'cat_transport': 'Transport',
    'cat_housing': 'Housing',
    'cat_entertainment': 'Entertainment',
    'cat_car': 'Car',

    // Alerts/Messages
    'alert_valid_data': 'Please enter valid title and amount',
    'alert_expense_added': 'Expense added',
    'alert_no_csv_data': 'No expenses for this month.',
    
    // Footer
    'footer_text': 'Simple Budget Tracker • Data stored locally in your browser',
    'footer_currency_label': 'Currency:',
  },
  fi: {
    // Nav/Header
    'app_title': 'Budjettiseuraaja',
    'nav_dashboard': 'Kojelauta',
    'nav_add': 'Lisää kulu',
    'nav_history': 'Historia',
    
    // Dashboard
    'dash_budget': 'Kuukausibudjetti',
    'dash_spent': 'Kulutettu',
    'dash_remaining': 'Jäljellä',
    'dash_chart_title': 'Tämän kuun kulutus',
    'dash_budget_label': 'Kuukausibudjetti:',
    'dash_save_btn': 'Tallenna budjetti',
    'dash_budget_placeholder': 'esim. 1000',
    
    // Add Expense
    'add_title': 'Lisää kulu',
    'add_field_title': 'Nimi',
    'add_field_amount': 'Summa',
    'add_field_category': 'Kategoria',
    'add_field_date': 'Päivämäärä',
    'add_btn_submit': 'Lisää',
    'add_btn_clear': 'Tyhjennä',

    // History
    'history_title': 'Historia',
    'history_filter_month': 'Kuukausi:',
    'history_filter_category': 'Kategoria:',
    'history_all': 'Kaikki',
    'history_reset': 'Nollaa',
    'history_csv': 'Lataa CSV',
    'history_no_expenses': 'Ei kuluja valituilla suodattimilla.',
    'history_delete_confirm': 'Poistetaanko kulu?',
    'history_edit_confirm': 'Tämä poistaa kulun ja esitäyttää Lisää kulu -näkymän. Jatka?',
    'history_alert_not_found': 'Ei löydy',

    // Categories
    'cat_other': 'Muut',
    'cat_food': 'Ruoka',
    'cat_transport': 'Liikenne',
    'cat_housing': 'Asuminen',
    'cat_entertainment': 'Viihde',
    'cat_car': 'Auto',

    // Alerts/Messages
    'alert_valid_data': 'Anna kelvollinen nimi ja summa',
    'alert_expense_added': 'Kulu lisätty',
    'alert_no_csv_data': 'Ei kuluja tältä kuukaudelta.',

    // Footer
    'footer_text': 'Yksinkertainen budjettiseuraaja • Tiedot tallennettu selaimeen',
    'footer_currency_label': 'Valuutta:',
  }
};

function tr(key) {
  return translations[currentLang][key] || translations['en'][key] || `MISSING_KEY_${key}`;
}
/* ------- END TRANSLATION DATA ------- */


/* ------- State ------- */
let state = {
  expenses: loadExpenses(),
  budget: loadBudget()
};

//Init DOM refs
const navBtns = $$('.nav-btn');
const views = $$('.view');

// Language Switcher setup
const langBtns = $$('#language-switcher .lang-btn');
langBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const newLang = btn.dataset.lang;
    if (newLang === currentLang) return; 
    
    currentLang = newLang;
    saveLanguage(currentLang);
    langBtns.forEach(b => b.classList.toggle('active', b.dataset.lang === currentLang));
    
    applyTranslations();
  });
});
//Set initial active language button
langBtns.forEach(b => b.classList.toggle('active', b.dataset.lang === currentLang));

//Currency switcher setup
const currencySelect = $('#currency');
currencySelect.value = currency;
currencySelect.addEventListener('change', () => {
  currency = currencySelect.value;
  saveCurrency(currency);
  renderDashboard();
  renderHistory();
});

const budgetAmountEl = $('#budgetAmount');
const spentAmountEl = $('#spentAmount');
const remainingAmountEl = $('#remainingAmount');
const budgetInput = $('#budgetInput');
const saveBudgetBtn = $('#saveBudgetBtn');

const expenseForm = $('#expenseForm');
const expTitle = $('#expTitle');
const expAmount = $('#expAmount');
const expCategory = $('#expCategory');
const expDate = $('#expDate');
const clearFormBtn = $('#clearForm');

const historyList = $('#historyList');
const filterMonth = $('#filterMonth');
const filterCategory = $('#filterCategory');
const resetFilters = $('#resetFilters');

const spendCanvas = $('#spendChart');
const ctx = spendCanvas.getContext('2d');

//Routing SPA
function showView(name){
  views.forEach(v => v.classList.add('hidden'));
  $('#view-' + name).classList.remove('hidden');
  navBtns.forEach(b => b.classList.toggle('active', b.dataset.view === name));
  if(name === 'dashboard') renderDashboard();
  if(name === 'history') renderHistory();
}
navBtns.forEach(btn => btn.addEventListener('click', () => showView(btn.dataset.view)));

// Default route
showView('dashboard');

//Storage functions
function loadExpenses(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  }catch(e){console.error(e); return [];}
}
function saveExpenses(){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.expenses));
}
function loadBudget(){
  const b = localStorage.getItem(STORAGE_BUDGET);
  return b ? Number(b) : 0;
}

//Save the budget locally and send a POST request to an external service
function saveBudget(){
  // local save
  localStorage.setItem(STORAGE_BUDGET, String(state.budget));
  
  //HTTP POST -reguest
  sendBudgetToServer(state.budget); 
}

//HTTP POST to jsonplaceholderiin
async function sendBudgetToServer(budgetAmount) {
  //doesn't send blank or 0 budget to server
  if (!budgetAmount || budgetAmount <= 0) {
    console.log('No empty or zero budget is sent to the server.');
    return;
  }
  
  try {
    // TAMA ON PAKOLLINEN HTTP POST -PYYNTO
    const response = await fetch('https://jsonplaceholder.typicode.com/posts', {
      method: 'POST', 
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: 'Monthly Budget Goal',
        body: `User set budget goal to ${budgetAmount} ${currency}`,
        userId: 1, 
        date: new Date().toISOString()
      })
    });

    if (response.ok) {
      const data = await response.json();
      console.log('Budget saved to external API (Mock API). Response ID:', data.id);
    } else {
      console.error('Budget submission failed. Status:', response.status);
    }
  } catch (error) {
    console.error('network connection error when sending budget.', error);
  }
}

//Budget controls
budgetInput.value = state.budget || '';
saveBudgetBtn.addEventListener('click', () => {
  const val = Number(budgetInput.value) || 0;
  state.budget = val;
  saveBudget(); //calls sendBudgetToServer()
  renderDashboard();
});

//Expense form
expenseForm.addEventListener('submit', e => {
  e.preventDefault();
  const title = expTitle.value.trim();
  const amount = Number(expAmount.value);
  const category = expCategory.value;
  const date = expDate.value || (new Date()).toISOString().slice(0,10);
  if(!title || !amount || amount <= 0){ alert(tr('alert_valid_data')); return; } 

  const item = {
    id: Date.now().toString(),
    title, amount: Number(amount.toFixed(2)), category, date
  };
  state.expenses.push(item);
  saveExpenses();
  expenseForm.reset();
  alert(tr('alert_expense_added'));
  showView('dashboard');
});

clearFormBtn.addEventListener('click', () => expenseForm.reset());

//History rendering & filters
function renderHistory(){
  const month = filterMonth.value; // 'YYYY-MM'
  const cat = filterCategory.value;
  let list = state.expenses.slice().sort((a,b) => b.id - a.id);

  if(month){
    list = list.filter(i => i.date.startsWith(month));
  }
  if(cat && cat !== 'All'){
    list = list.filter(i => i.category === cat);
  }

  if(list.length === 0){
    historyList.innerHTML = `<div class="card"><p style="color:var(--muted)">${tr('history_no_expenses')}</p></div>`; 
    return;
  }

  historyList.innerHTML = '';
  list.forEach(item => {
    const el = document.createElement('div');
    el.className = 'history-item';
    const categoryKey = 'cat_' + item.category.toLowerCase();
    const translatedCategory = tr(categoryKey);

    el.innerHTML = `
      <div class="h-left">
        <div>
          <div class="h-title">${escapeHtml(item.title)} <span style="color:var(--muted);font-weight:600">· ${escapeHtml(translatedCategory)}</span></div>
          <div class="h-meta">${item.date}</div>
        </div>
      </div>
      <div class="h-actions">
        <div style="text-align:right">
          <div style="font-weight:700">${formatCurrency(item.amount)}</div>
        </div>
        <div>
          <button class="btn-ghost" data-id="${item.id}">Edit</button>
          <button class="btn-danger" data-delete="${item.id}">Delete</button>
        </div>
      </div>
    `;
    historyList.appendChild(el);
  });

  // delete handler
  historyList.querySelectorAll('[data-delete]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.delete;
      if(!confirm(tr('history_delete_confirm'))) return; 
      state.expenses = state.expenses.filter(i => i.id !== id);
      saveExpenses();
      renderHistory();
      if($('#view-dashboard').classList.contains('hidden') === false) renderDashboard();
    });
  });

  // edit handler (quick: prefills form and navigates to add)
  historyList.querySelectorAll('[data-id]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const it = state.expenses.find(x => x.id === id);
      if(!it) return alert(tr('history_alert_not_found')); 
      if(!confirm(tr('history_edit_confirm'))) return; 
      state.expenses = state.expenses.filter(x => x.id !== id);
      saveExpenses();
      expTitle.value = it.title;
      expAmount.value = it.amount;
      expCategory.value = it.category;
      expDate.value = it.date;
      showView('add');
    });
  });
}

filterMonth.addEventListener('change', renderHistory);
filterCategory.addEventListener('change', renderHistory);
resetFilters.addEventListener('click', () => {
  filterMonth.value = '';
  filterCategory.value = 'All';
  renderHistory();
});

//Dashboard rendering & simple chart
function renderDashboard(){
  const monthStr = (new Date()).toISOString().slice(0,7); // YYYY-MM
  const monthExpenses = state.expenses.filter(e => e.date.startsWith(monthStr));
  const spent = monthExpenses.reduce((s,i) => s + Number(i.amount), 0);
  const budget = Number(state.budget) || 0;
  const remaining = budget - spent;

  budgetAmountEl.textContent = budget ? formatCurrency(budget) : '—';
  spentAmountEl.textContent = formatCurrency(spent);
  remainingAmountEl.textContent = budget ? formatCurrency(remaining) : '—';
  if (budget) {
      remainingAmountEl.style.color = remaining < 0 ? 'var(--danger)' : 'var(--text)';
  } else {
      remainingAmountEl.style.color = 'var(--muted)';
  }


  const days = {};
  monthExpenses.forEach(e => {
    const d = e.date.slice(8,10);
    days[d] = (days[d] || 0) + e.amount;
  });

  // Prepare data for up to 31 days or only days in current month
  const now = new Date();
  const year = now.getFullYear();
  const monthIndex = now.getMonth();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const labels = [];
  const data = [];
  for(let d=1; d<=daysInMonth; d++){
    const key = String(d).padStart(2,'0');
    labels.push(key);
    data.push(Number((days[key] || 0).toFixed(2)));
  }
  drawBarChart(ctx, labels, data);
}

//simple bar chart
function drawBarChart(ctx, labels, data){
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;
  ctx.clearRect(0,0,w,h);
  const pad = 24;
  const chartW = w - pad*2;
  const chartH = h - pad*2;
  const max = Math.max(...data, 10);
  const barW = Math.max(4, chartW / data.length * 0.8);
  data.forEach((val,i) => {
    const x = pad + i * (chartW / data.length) + ( (chartW/data.length) - barW)/2;
    const barH = (val / max) * chartH;
    const y = h - pad - barH;
    ctx.fillStyle = '#22c55e';
    ctx.fillRect(x, y, barW, barH);
  });

  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.font = '12px system-ui';
  for(let i=0;i<labels.length;i += Math.ceil(labels.length/6)) {
    const x = pad + i * (chartW / labels.length) + (chartW/labels.length)/2;
    ctx.fillText(labels[i], x-8, h - 6);
  }
}

//Utilities
function formatCurrency(n){
  try {
    return Number(n).toLocaleString(currentLang === 'fi' ? 'fi-FI' : 'en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    });
  } catch {
    return n + ' ' + currency;
  }
}

function escapeHtml(s){ return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }


// Function to apply all translations to the DOM
function applyTranslations() {
  const currentT = translations[currentLang];
  
  //Static text elements
  $$('[data-tr]').forEach(el => {
    const key = el.dataset.tr;
    if (el.tagName === 'OPTION' && el.parentElement.id === 'filterCategory') {
      if (el.value === 'All') {
         el.textContent = currentT['history_all'];
      } else {
        el.textContent = currentT[key];
      }
    } else {
      el.textContent = currentT[key] || translations.en[key];
    }
  });

  //Placeholder text (using data-tr-ph attribute)
  $$('[data-tr-ph]').forEach(el => {
    const key = el.dataset.trPh;
    el.placeholder = currentT[key] || translations.en[key];
  });

  //Navigation buttons (which don't use data-tr to avoid conflict with active class logic)
  $$('.nav-btn[data-view="dashboard"]')[0].textContent = currentT.nav_dashboard;
  $$('.nav-btn[data-view="add"]')[0].textContent = currentT.nav_add;
  $$('.nav-btn[data-view="history"]')[0].textContent = currentT.nav_history;
  $('#appTitle').textContent = currentT.app_title;
  
  renderDashboard();
  renderHistory();
}

//CSV Download
$('#downloadCsv').addEventListener('click', () => {
  const month = filterMonth.value || new Date().toISOString().slice(0,7);
  const items = state.expenses.filter(e => e.date.startsWith(month));

  if (items.length === 0) {
    alert(tr('alert_no_csv_data')); 
    return;
  }

  // Build CSV data
  let csv = "Title,Amount,Category,Date\n";
  items.forEach(e => {
    csv += `"${e.title}","${e.amount} ${currency}","${e.category}","${e.date}"\n`;
  });

  // Trigger download
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `expenses-${month}.csv`;
  a.click();
  URL.revokeObjectURL(url);
});

applyTranslations();