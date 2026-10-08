/** Latest term (by start date) across every academic year of a student. */
export function latestTermOf(student) {
  let latest = null;
  let year = "";
  let at = null;
  (student?.academicRecords || []).forEach((rec) => {
    (rec.terms || []).forEach((term) => {
      const when = term.startDate ? new Date(term.startDate).getTime() : 0;
      if (at === null || when > at) { at = when; latest = term; year = rec.yearLabel; }
    });
  });
  return latest ? { term: latest, yearLabel: year } : null;
}

export function feeSummary(student) {
  const found = latestTermOf(student);
  const fees = found?.term?.fees || {};
  const total = Number(fees.totalFees) || 0;
  const paid = Number(fees.amountPaid) || 0;
  const balance = fees.balance ?? Math.max(total - paid, 0);
  const status = !found ? "none" : total > 0 && balance <= 0 ? "paid" : paid > 0 ? "partial" : "unpaid";
  return { ...found, total, paid, balance, arrears: Number(fees.arrears) || 0, status, hasTerm: !!found };
}

export const cedi = (n) => `GH₵ ${Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
