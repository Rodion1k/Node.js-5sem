class Statistic {
    constructor() {
        this.commitsCount = 0;
        this.queriesCount = 0;
        this.startStatisticTime = 0;
        this.endStatisticTime = 0;
    }

    getTxtStatistic() {
        return `Start time:${(formatDate(this.startStatisticTime))} EndTime: ${(formatDate(this.endStatisticTime))} Queries count: ${(this.queriesCount)} Commits count: ${(this.commitsCount)} Time: ${this.endStatisticTime - this.startStatisticTime} ms\n`;
    }

    getJsonStatistic() {
        return JSON.stringify({
            startTime: formatDate(this.startStatisticTime),
            endTime: formatDate(this.endStatisticTime),
            queriesCount: this.queriesCount,
            commitsCount: this.commitsCount,
            time: this.endStatisticTime - this.startStatisticTime
        });
    }
}

const formatDate = (date) => {
    const d = new Date(date);
    return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
}
module.exports = Statistic;