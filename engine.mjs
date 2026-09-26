// Dimensional comparison only. Scores are not predictions of comfort or fit.
export const fields = ['chest', 'length', 'sleeve'];
const tolerances = { chest: 4, length: 5, sleeve: 4 };
const weights = { chest: 0.45, length: 0.30, sleeve: 0.25 };

export function validateMeasurements(value) {
  if (!value || typeof value !== 'object') throw new TypeError('Measurements are required.');
  const parsed = {};
  for (const field of fields) {
    const raw = value[field];
    if (raw === '' || raw === null || raw === undefined) throw new RangeError(`Enter ${field} width or length.`);
    const number = Number(raw);
    if (!Number.isFinite(number) || number < 1 || number > 300) throw new RangeError(`${field} must be between 1 and 300 cm.`);
    parsed[field] = Math.round(number * 10) / 10;
  }
  return parsed;
}

export function compareGarments(reference, inventory) {
  const ref = validateMeasurements(reference);
  if (!Array.isArray(inventory) || inventory.length > 30) throw new RangeError('Use up to 30 donated garments.');
  return inventory.map((item, index) => {
    const measurements = validateMeasurements(item);
    const differences = Object.fromEntries(fields.map((field) => [field, Math.round((measurements[field] - ref[field]) * 10) / 10]));
    const score = fields.reduce((sum, field) => sum + weights[field] * Math.abs(differences[field]) / tolerances[field], 0);
    const maxNormalized = Math.max(...fields.map((field) => Math.abs(differences[field]) / tolerances[field]));
    const label = maxNormalized <= 1 ? 'Close measurements' : maxNormalized <= 2.5 ? 'Worth a look' : 'Check carefully';
    return { ...item, measurements, differences, score: Math.round(score * 100) / 100, label, originalIndex: index };
  }).sort((a, b) => a.score - b.score || a.originalIndex - b.originalIndex);
}
