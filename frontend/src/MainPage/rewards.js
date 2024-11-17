export const getRewardForStreak = (streak) => {
    if (streak >= 30) {
        return { accessory: 'hat' };
    } else if (streak >= 15) {
        return { accessory: 'bowtie' };
    } else if (streak >= 7) {
        return { accessory: 'glasses' };
    } else {
        return { accessory: 'none' };
    }
};