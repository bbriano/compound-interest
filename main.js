import { el, mount, setChildren } from "./redom.es.min.js";

class App {
    constructor() {
        this.data = {
            initialInvestment: 1000,
            contributionFrequency: 7,
            contributionAmount: 50,
            averageInterestRate: 5,
            value50Year: [],
        };

        this.el = el("form", 
            el("label", "Initial investment", 
                this.initialInvestment = el("input", { type: "number" }),
            ),
            el("label", "Contribution frequency", 
                this.contributionFrequency = el("select",
                    el("option", "Daily", { value: 1 }),
                    el("option", "Weekly", { value: 7 }),
                    el("option", "Fortnightly", { value: 14 }),
                    el("option", "Monthly", { value: 365 }),
                ),
            ),
            el("label", "Contribution amount", 
                this.contributionAmount = el("input", { type: "number" }),
            ),
            el("label", "Average annual interest rate", 
                this.averageInterestRate = el("input", { type: "number" }),
            ),
            this.chart = el("canvas"),
            this.value50YearList = el("table"),
            {
                style: `
                    display: flex;
                    flex-direction: column;
                `
            },
        );

        this.value50YearList.update = (values) => {
            setChildren(this.value50YearList);
            mount(this.value50YearList, el("tr", el("th", "year"), el("th", "networth")));
            values.forEach((val, i) => {
                mount(this.value50YearList, el("tr", el("td", i+1), el("td", val)));
            })
        };

        this.chart.update = (values) => {
            const ctx = this.chart.getContext('2d');
            new Chart(ctx, {
                type: "bar",
                data: {
                    labels: [...Array(values.length).keys()].map(x => x+1),
                    datasets: [{
                        label: "networth",
                        data: values.map(Math.round),
                    }],
                },
                options: {
                    scales: {
                        yAxes: [{
                            ticks: {
                                beginAtZero: true,
                            }
                        }]
                    },
                }
            });
        };

        // Update on field changes
        ["initialInvestment", "contributionFrequency", "contributionAmount", "averageInterestRate"].forEach(key => {
            this[key].addEventListener("change", (e) => {
                this.update({ ...this.data, [key]: e.target.value })
            });
        });

        this.update(this.data);
    }
    
    update(data) {
        data.initialInvestment = Number(data.initialInvestment);
        data.contributionFrequency = Number(data.contributionFrequency);
        data.contributionAmount = Number(data.contributionAmount);
        data.averageInterestRate = Number(data.averageInterestRate);

        this.initialInvestment.value = data.initialInvestment;
        this.contributionFrequency.value = data.contributionFrequency;
        this.contributionAmount.value = data.contributionAmount;
        this.averageInterestRate.value = data.averageInterestRate;

        const values = this.calculate50YearValues(data);
        this.value50YearList.update(values.map(numberToMoney));
        this.chart.update(values)

        this.data = data;
    }

    calculate50YearValues(data) {
        const values = [];
        const dailyFactor = Math.exp(Math.log(1+data.averageInterestRate/100) / 365);
        let networth = data.initialInvestment;
        for (let i = 1; i <= 365*50; i++) {
            networth *= dailyFactor;
            if (i % data.contributionFrequency == 0) {
                networth += data.contributionAmount;
            }
            if (i % 365 == 0) {
                values.push(networth)
            }
        }
        return values;
    }
}

function numberToMoney(num) {
    return num.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}

mount(document.body, new App());
