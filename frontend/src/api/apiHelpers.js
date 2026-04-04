/**
 * Spring {@code ApiResponse<T>} unwrap helper.
 * @param {import('axios').AxiosResponse} res
 */
export function unwrapData(res) {
  if (!res || !res.data) return null;
  return res.data.data;
}

export const EXPENSE_CATEGORY_KEYS = [
  'RENT',
  'ELECTRICITY',
  'TRANSPORT',
  'PURCHASE',
  'SALARY',
  'MAINTENANCE',
  'PACKAGING',
  'OTHER',
];

export function mapExpenseCategory(input) {
  if (!input || typeof input !== 'string') return 'OTHER';
  const u = input.trim().toUpperCase().replace(/\s+/g, '_');
  return EXPENSE_CATEGORY_KEYS.includes(u) ? u : 'OTHER';
}
