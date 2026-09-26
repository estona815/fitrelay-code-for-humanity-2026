import { compareGarments, fields, validateMeasurements } from './engine.mjs';

const $ = (selector) => document.querySelector(selector);
const sampleInventory = [
  { id: 1, name: 'Riverside Utility Jacket', type: 'Outer layer', note: 'Olive · fictional', chest: 52, length: 68, sleeve: 63, art: 'olive' },
  { id: 2, name: 'Maple Denim Jacket', type: 'Outer layer', note: 'Blue · fictional', chest: 56, length: 72, sleeve: 66, art: 'denim' },
  { id: 3, name: 'Pine Ridge Overshirt', type: 'Outer layer', note: 'Rust plaid · fictional', chest: 53, length: 71, sleeve: 65, art: 'rust' },
];
let inventory = sampleInventory.map((item) => ({ ...item }));
let nextId = 4;
let editingId = null;
let toastTimer;

function text(tag, className, value) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  node.textContent = value;
  return node;
}

function toast(message) {
  const node = $('#status');
  node.textContent = message;
  node.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => node.classList.remove('show'), 3300);
}

function getReference() {
  return validateMeasurements(Object.fromEntries(fields.map((field) => [field, $(`#ref-${field}`).value])));
}

function garmentVisual(item) {
  const art = text('span', `garment-image ${item.art || 'custom'}`, item.art ? '' : '↗');
  art.setAttribute('aria-hidden', 'true');
  return art;
}

function itemCell(item) {
  const cell = document.createElement('div');
  cell.className = 'item-cell';
  cell.append(garmentVisual(item));
  const words = document.createElement('div');
  words.append(text('div', 'item-title', item.name), text('div', 'item-sub', item.note || item.type));
  cell.append(words);
  return cell;
}

function renderInventory() {
  const list = $('#inventory-list');
  list.replaceChildren();
  if (!inventory.length) { list.append(text('p', 'empty-state', 'Add at least one donated garment to compare.')); return; }
  inventory.forEach((item) => {
    const row = document.createElement('div'); row.className = 'inventory-row';
    row.append(itemCell(item), text('div', 'type-cell', item.type));
    fields.forEach((field) => { const cell = text('div', 'number', `${item[field]} cm`); cell.dataset.label = field === 'chest' ? 'Chest' : field[0].toUpperCase() + field.slice(1); row.append(cell); });
    const controls = document.createElement('div'); controls.className = 'row-actions';
    const edit = text('button', '', 'Edit'); edit.type = 'button'; edit.setAttribute('aria-label', `Edit ${item.name}`); edit.addEventListener('click', () => openDialog(item));
    const remove = text('button', '', 'Remove'); remove.type = 'button'; remove.setAttribute('aria-label', `Remove ${item.name}`); remove.addEventListener('click', () => { inventory = inventory.filter((entry) => entry.id !== item.id); renderInventory(); runCompare(false); toast(`${item.name} removed from this tab.`); });
    controls.append(edit, remove); row.append(controls); list.append(row);
  });
}

function signed(value) { return `${value > 0 ? '+' : ''}${value} cm`; }

function renderResults(ranked) {
  const list = $('#results-list'); list.replaceChildren();
  if (!ranked.length) { list.append(text('p', 'empty-state', 'Add a garment, then compare measurements.')); return; }
  ranked.forEach((item, index) => {
    const row = document.createElement('div'); row.className = 'result-row';
    const rankCell = document.createElement('div'); rankCell.className = 'rank-cell'; rankCell.append(text('span', 'rank', String(index + 1))); row.append(rankCell);
    row.append(itemCell(item));
    fields.forEach((field) => { const difference = item.differences[field]; const cell = text('div', `delta ${difference < 0 ? 'negative' : difference > 0 ? 'positive' : 'zero'}`, signed(difference)); cell.dataset.label = field === 'chest' ? 'Chest' : field[0].toUpperCase() + field.slice(1); row.append(cell); });
    const labelCell = document.createElement('div'); labelCell.className = 'label-cell'; const variant = item.label === 'Close measurements' ? '' : item.label === 'Worth a look' ? 'review' : 'far'; labelCell.append(text('span', `match-label ${variant}`, item.label)); row.append(labelCell);
    list.append(row);
  });
}

function runCompare(announce = true) {
  try {
    const ranked = compareGarments(getReference(), inventory);
    renderResults(ranked);
    if (announce) toast(`${ranked.length} donated garments compared locally. Check style and fabric in person.`);
  } catch (error) {
    renderResults([]);
    if (announce) toast(error.message);
  }
}

function openDialog(item = null) {
  editingId = item?.id ?? null;
  $('#dialog-title').textContent = item ? 'Edit donated garment' : 'Add donated garment';
  $('#item-name').value = item?.name ?? '';
  $('#item-type').value = item?.type ?? 'Outer layer';
  fields.forEach((field) => { $(`#item-${field}`).value = item?.[field] ?? ''; });
  $('#garment-dialog').showModal();
  $('#item-name').focus();
}

function resetSample() {
  inventory = sampleInventory.map((item) => ({ ...item })); nextId = 4;
  $('#ref-chest').value = '54'; $('#ref-length').value = '70'; $('#ref-sleeve').value = '64';
  renderInventory(); runCompare(false);
  toast('Fictional sample loaded. Replace it with real garment measurements when ready.');
}

$('#reference-form').addEventListener('submit', (event) => { event.preventDefault(); runCompare(); });
$('#load-sample').addEventListener('click', resetSample);
$('#add-garment').addEventListener('click', () => openDialog());
$('#top-add').addEventListener('click', () => openDialog());
$('#close-dialog').addEventListener('click', () => $('#garment-dialog').close());
$('#cancel-dialog').addEventListener('click', () => $('#garment-dialog').close());
$('#garment-form').addEventListener('submit', (event) => {
  event.preventDefault();
  try {
    const values = validateMeasurements(Object.fromEntries(fields.map((field) => [field, $(`#item-${field}`).value])));
    const name = $('#item-name').value.trim(); if (!name) throw new RangeError('Enter an item name.');
    const type = $('#item-type').value;
    if (editingId) {
      const old = inventory.find((item) => item.id === editingId);
      if (!old) throw new Error('That garment is no longer available.');
      Object.assign(old, values, { name, type, note: `${type} · entered in this tab` });
    } else {
      if (inventory.length >= 30) throw new RangeError('Use up to 30 donated garments.');
      inventory.push({ id: nextId++, name, type, note: `${type} · entered in this tab`, art: 'custom', ...values });
    }
    $('#garment-dialog').close(); renderInventory(); runCompare(false); toast(`${name} saved in this tab.`);
  } catch (error) { toast(error.message); }
});
$('#menu-toggle').addEventListener('click', () => { const open = $('#nav').classList.toggle('open'); $('#menu-toggle').setAttribute('aria-expanded', String(open)); });
$('#nav').addEventListener('click', (event) => { if (event.target.closest('a')) { $('#nav').classList.remove('open'); $('#menu-toggle').setAttribute('aria-expanded', 'false'); } });

resetSample();
