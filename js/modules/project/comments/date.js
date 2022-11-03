export default class CommentDate {
    constructor(initialComment = false, date, period) {
        this.initialComment = initialComment;
        this.date = date;
        this.period = period;
    }
    get periods() {
        return {
            second: 1000,
            get minute() {
                return 60 * this.second;
            },
            get hour() {
                return 60 * this.minute;
            },
            get day() {
                return 24 * this.hour;
            },
            get week() {
                return 7 * this.day;
            },
            get month() {
                return 4 * this.week;
            },
            get year() {
                return 12 * this.month;
            }
        }
    }
    get timeStampDiff() {
        const actualDate = () => {
            if (this.initialComment === true) 
                return Date.now() + this.date * this.periods[this.period];
            else 
                return Date.now();
        };
        const {createdAt: timeStamp} = JSON.parse(localStorage.currentUser);

        if (this.initialComment === true) {
            return actualDate() - timeStamp;
        } else {
            return actualDate() - this.date;
        }
    }
    get time() {
        const periods = Object.keys(this.periods);
        const values = periods.map(period => Math.floor(this.timeStampDiff / this.periods[period]))
        const currentPeriod = values.findLast(value => value);
        const currentPeriodIndex = values.findLastIndex(value => value);
        const periodNames = {
            second: "segundo",
            minute: "minuto",
            hour: "hora",
            day: "dia",
            week: "semana",
            month: "mês",
            year: "ano",
        }
        const periodName = periodNames[periods[currentPeriodIndex]];
        const handleGrammar = (isPlural = true) => {
            const text = `${currentPeriod} ${periodName}`;
            const complement = "atrás";
            const plural = `${text}s ${complement}`;
            const single = `${text} ${complement}`;

            if (isPlural) {
                const pluralOfMonths = `${currentPeriod} meses ${complement}`;

                return periodName === "mês" ? pluralOfMonths : plural;
            } else {
                return single;
            }
        }

        if (!currentPeriod) 
            return "agora mesmo";
        else if (currentPeriod > 1) 
            return handleGrammar();
        else
            return handleGrammar(false);

    }
}

