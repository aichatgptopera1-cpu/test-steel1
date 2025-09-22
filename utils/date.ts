export const getPastMonthLabels = (): string[] => {
    const labels: string[] = Array(30).fill('');
    labels[0] = '۱ ماه قبل';
    labels[7] = '۳ هفته قبل';
    labels[14] = '۲ هفته قبل';
    labels[21] = '۱ هفته قبل';
    labels[29] = 'اکنون';
    return labels;
};

export const getPastDaysLabels = (count: number): string[] => {
    const days = ['یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه', 'شنبه'];
    const today = new Date().getDay();
    const labels: string[] = [];
    for (let i = count - 1; i >= 0; i--) {
        labels.push(days[(today - i + 7) % 7]);
    }
    return labels;
};
